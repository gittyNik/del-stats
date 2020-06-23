import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import { Cohort } from './cohort';
import { CohortBreakout, getAllBreakoutsInCohortMilestone } from './cohort_breakout';
import { Program } from './program';
import { Milestone } from './milestone';
import { Topic } from './topic';
import { Team, createMilestoneTeams } from './team';
import { User } from './user';
import { LearnerChallenge } from './learner_challenge';
import { getChallengesByTopicId } from './challenge';
import { getRecentCommitByUser } from '../integrations/github/controllers/commits.controller';
import {
  getLatestCommitInCohort,
  getTotalTeamAndUserCommitsCount,
  userAndTeamCommitsDayWise,
  weeklyCommitActivityData,
} from '../integrations/github/controllers';
import { getGithubConnecionByUserId } from './social_connection';
import { getResourceByTopic } from './resource';


export const CohortMilestone = db.define('cohort_milestones', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  release_time: Sequelize.DATE,
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts', key: 'id' },
  },
  milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'milestones', key: 'id' },
  },
  reviewer_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  review_scheduled: Sequelize.DATE,
  review_time: Sequelize.DATE,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

const { lte, gt, between } = Sequelize.Op;

export const getDataForMilestoneName = id => CohortMilestone.findOne({
  where: {
    id,
  },
  include: [Cohort, Milestone],
});

export const getCurrentCohortMilestones = () => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findAll({
    order: Sequelize.col('release_time'),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
    },
    include: [Cohort, Milestone],
  });
};

CohortMilestone.prototype.getUsers = function getCurrentUsers() {
  return Cohort.findByPk(this.cohort_id).then(cohort => cohort.learners);
};

const populateTeamsWithLearners = teams => {
  const learnerGetters = teams.map(team => User.findAll({
    where: { id: { [Sequelize.Op.in]: team.learners } },
  }).then(learners => {
    team.learners = learners;
    return team;
  }));
  return Promise.all(learnerGetters);
};

export const getMilestoneTeams = milestone_id => Team.findAll({
  where: {
    cohort_milestone_id: milestone_id,
  },
  raw: true,
});

export const getCohortMilestones = cohort_id => CohortMilestone.findAll({
  where: { cohort_id },
  include: [Milestone],
});

export const getCohortMilestoneBylearnerId = learner_id => Cohort.findOne({
  where: {
    learners: {
      [Sequelize.Op.contains]: [learner_id],
    },
  },
}).then(cohort => getCohortMilestones(cohort.id));


export const getOrCreateMilestoneTeams = milestone_id => getMilestoneTeams(milestone_id)
  .then(teams => {
    if (teams.length !== 0) {
      return teams;
    }
    return createMilestoneTeams(milestone_id);
  })
  .then(populateTeamsWithLearners);

// milestone_id=null represents the topics belonging to the program
export const findTopicsForCohortAndMilestone = (cohort_id, milestone_id = null) => Topic.findAll({
  where: { milestone_id },
  raw: true,
  include: [
    {
      model: CohortBreakout,
      where: {
        cohort_id,
        topic_id: Sequelize.literal('"topics"."id"=cohort_breakouts.topic_id'),
      },
      required: false,
    },
  ],
}).then(async topics => {
  for (let i = 0; i < topics.length; i++) {
    topics[i].challenges = await getChallengesByTopicId(topics[i].id)
    Promise.all(topics[i].challenges.map((challenge, index) =>
      LearnerChallenge.count({
        where: {
          challenge_id: challenge,
        },
        raw: true
      }, ).then(count => {
        topics[i].challenges[index].dataValues.attemptedCount = count;
      })
    ))
    topics[i].resources = await getResourceByTopic(topics[i].id);
  }
  return topics;
});

const populateTeamsWithLearnersWrapper = async ([
  topics,
  programTopics,
  teams,
  breakouts,
]) => {
  teams = await populateTeamsWithLearners(teams);
  return [topics, programTopics, teams, breakouts];
};

const populateLearnerStats = (
  user_id,
  cohort_id,
  cohort_milestone_id,
) => async ([topics, programTopics, teams, breakouts]) => {
  let socialConnection = await getGithubConnecionByUserId(user_id);
  let Teams = _.filter(teams, team => _.some(team.learners, { id: user_id }));

  let lastWeek = [];
  let lastWeekCommitsInRepoDayWise = await weeklyCommitActivityData(
    Teams[0].github_repo_link,
  );
  if (typeof lastWeekCommitsInRepoDayWise[51] !== 'undefined') {
    let dayId = new Date(Date.now()).getDay();
    lastWeek = lastWeekCommitsInRepoDayWise[51].days;
    let cnt = 6 - dayId;
    lastWeek.splice(dayId + 1, cnt);
    let pWeek = lastWeekCommitsInRepoDayWise[50].days;
    pWeek.splice(0, 6 - cnt + 1);
    lastWeek = pWeek.concat(lastWeek);
    // lastWeek.splice(0, 0, pWeek);
  }
  let u = await userAndTeamCommitsDayWise(
    Teams[0].learners,
    Teams[0].github_repo_link,
  );
  const latestCohortCommit = await getLatestCommitInCohort(cohort_milestone_id);
  const latestCommitByUser = await getRecentCommitByUser(
    socialConnection.username,
    Teams[0].github_repo_link,
  );
  const teamAndUserCommits = await getTotalTeamAndUserCommitsCount(
    user_id,
    Teams[0].github_repo_link,
  );

  let { userCommitsDayWise, teamCommitsDayWise } = u;
  let stats = {
    lastWeekCommitsInRepoDayWise: lastWeek,
    userCommitsDayWise,
    teamCommitsDayWise,
    latestCohortCommit,
    latestCommitByUser,
    teamAndUserCommits,
  };

  return [topics, programTopics, teams, stats, breakouts];
};

export const findBreakoutsForMilestone = async (cohort_id, milestone_id) => {
  let breakouts = await getAllBreakoutsInCohortMilestone(cohort_id, milestone_id);
  return breakouts.filter((breakout) => (breakout != null));
};


export const getCurrentMilestoneOfCohortDelta = (cohort_id) => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findOne({
    order: Sequelize.col('release_time'),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
      cohort_id,
    },
    include: [Cohort, Milestone],
    raw: true,
  })
    .then(milestone => {
      if (!milestone) return milestone;
      const { milestone_id, id } = milestone;
      return Promise.all([
        findTopicsForCohortAndMilestone(cohort_id, milestone_id),
        findTopicsForCohortAndMilestone(cohort_id),
        getOrCreateMilestoneTeams(id),
      ])
        .then(([topics, programTopics, teams]) => {
          // console.log(`Milestone topics: ${topics.length}, Program topics: ${programTopics.length}`);
          milestone.topics = topics;
          milestone.programTopics = programTopics;
          milestone.teams = teams;
          return milestone;
        });
    });
};

// TODO: Add filters here for Milestone and see if it solves bug
export const getLiveMilestones = (program, cohort_duration) => {
  const now = Sequelize.literal('NOW()');
  let nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  return CohortMilestone.findAll({
    order: [
      [Cohort, 'duration', 'ASC'],
    ],
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [between]: [now, nextSevenDays] },
      '$cohort.program_id$': program,
      '$cohort.duration$': cohort_duration,
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};

export const populateMilestone = async (milestone) => {
  if (!milestone) return milestone;
  const {
    cohort_id,
    milestone_id,
    id,
    release_time,
  } = milestone;
  return Promise.all([
    findTopicsForCohortAndMilestone(cohort_id, milestone_id),
    findTopicsForCohortAndMilestone(cohort_id),
    createMilestoneTeams(id, release_time),
    findBreakoutsForMilestone(cohort_id, milestone_id),
  ])
    .then(populateTeamsWithLearnersWrapper)
    // UNCOMMENT THIS ONCE THE STATS ARE READY
    // .then(populateLearnerStats(user_id, cohort_id, milestone.id))
    .then(([topics, programTopics, teams,
      // UNCOMMENT THIS ONCE THE STATS ARE READY
      // stats,
      breakouts,
    ]) => { // add breakouts
      milestone.topics = topics;
      milestone.programTopics = programTopics;
      milestone.teams = teams;
      // UNCOMMENT THIS ONCE THE STATS ARE READY
      // milestone.stats = stats;
      milestone.breakouts = breakouts;
      //  milestone.breakouts = milestones;
      return milestone;
    });
};

export const getCurrentMilestoneOfCohort = async (cohort_id, user_id) => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findOne({
    order: Sequelize.col('release_time'),
    where: {
      release_time: {
        [lte]: now,
      },
      review_scheduled: {
        [gt]: now,
      },
      cohort_id,
    },
    include: [Cohort, Milestone],
    raw: true,
  }).then(milestone => {
    if (!milestone) return milestone;
    const { milestone_id, id } = milestone;
    return Promise.all([
      findTopicsForCohortAndMilestone(cohort_id, milestone_id),
      findTopicsForCohortAndMilestone(cohort_id),
      createMilestoneTeams(id),
      findBreakoutsForMilestone(cohort_id, milestone_id),
    ])
      .then(populateTeamsWithLearnersWrapper)
      // UNCOMMENT THIS ONCE THE STATS ARE READY
      // .then(populateLearnerStats(user_id, cohort_id, milestone.id))
      .then(([topics, programTopics, teams,
        // UNCOMMENT THIS ONCE THE STATS ARE READY
        // stats,
        breakouts]) => { // add breakouts
        milestone.topics = topics;
        milestone.programTopics = programTopics;
        milestone.teams = teams;
        // UNCOMMENT THIS ONCE THE STATS ARE READY
        // milestone.stats = stats;
        milestone.breakouts = breakouts;
        //  milestone.breakouts = milestones;
        return milestone;
      });
  });
};

export const getCohortMilestoneById = (milestone_id) => CohortMilestone.findOne({
  where: {
    id: milestone_id,
  },
  include: [Cohort, Milestone],
  raw: true,
}).then(milestone => populateMilestone(milestone));


function* calculateReleaseTime(cohort_start, pending, cohort_duration, cohort_program) {
  const DAY_MSEC = 86400000;
  let milestone_duration = 0;
  const start = new Date(cohort_start);
  let end;
  if (cohort_duration === 16) {
    milestone_duration = 7;
  } else {
    milestone_duration = 14;
  }
  start.setHours(0, 0, 0, 0);
  if (cohort_duration === 26) {
    // Calculate first Saturday 00:00:00
    start.setDate(cohort_start.getDate() + ((6 + 7 - cohort_start.getDay()) % 7));
    // Calculate Monday 23:59:59
    end = new Date(+start + DAY_MSEC * 2.99999);
  } else {
    // Calculate first Monday 00:00:00
    start.setDate(cohort_start.getDate() + ((1 + 7 - cohort_start.getDay()) % 7));
    // Calculate Tuesday 23:59:59
    end = new Date(+start + DAY_MSEC * 1.99999);
  }

  while (pending--) {
    if (pending === 0) {
      // Calculate next friday
      end.setDate(start.getDate() + (
        (5 + milestone_duration - cohort_start.getDay()) % milestone_duration));
    }
    yield { start, end };
    start.setTime(+end + 1000);
    end.setTime(+end + DAY_MSEC * milestone_duration);
  }
}

export const createCohortMilestones = cohort_id => Cohort.findByPk(cohort_id, {
  include: [Program],
  raw: true,
}).then(cohort => {
  const milestones = cohort['program.milestones'];
  const cohort_duration = cohort.duration;
  const cohort_program_id = cohort.program_id;
  const release = calculateReleaseTime(cohort.start_date,
    milestones.length, cohort_duration, cohort_program_id);
  const cohort_milestones = milestones.map(milestone_id => {
    const { value } = release.next();

    return {
      id: uuid(),
      release_time: new Date(value.start),
      cohort_id,
      milestone_id,
      review_scheduled: new Date(value.end),
      cohort_duration,
      cohort_program_id,
    };
  });

  return CohortMilestone.bulkCreate(cohort_milestones);
});

// TODO: update reviewer_id after authentication is done
export const markMilestoneReview = id => CohortMilestone.update(
  {
    review_time: Sequelize.literal('now()'),
  },
  {
    where: { id, review_time: null },
    returning: true,
    raw: true,
  },
).then(results => (results[1][0] ? results[1][0] : Promise.reject('Review could not be saved')));
