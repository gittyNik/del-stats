import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import db from '../database';
import { Cohort, addLearnerPaths } from './cohort';
import {
  CohortBreakout,
  getAllBreakoutsInCohortMilestone,
} from './cohort_breakout';
import { Program } from './program';
import { Milestone } from './milestone';
import { Topic } from './topic';
import { Team, createMilestoneTeams, getLearnerTeam } from './team';
import { User } from './user';
import { LearnerChallenge } from './learner_challenge';
import { getTeamCommitsForMilestone } from './learner_github_milestones';
import { getChallengesByTopicId } from './challenge';
import {
  getRecentCommitByUser,
  getLatestCommitInCohort,
  getTotalTeamAndUserCommitsCount,
} from '../integrations/github/controllers/index';

import { getResourceByTopic } from './resource';
import { Application } from './application';

export class NoMilestoneCommits extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = 'NoMilestoneCommits';
  }
}

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

const {
  lte, gt, between,
} = Sequelize.Op;

// eslint-disable-next-line max-len
export const findInCohortMilestones = (where, attributes, include, order) => CohortMilestone.findOne({
  where,
  include,
  order,
  attributes,
});

export const getDataForMilestoneName = (id) => CohortMilestone.findOne({
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
  return Cohort.findByPk(this.cohort_id).then((cohort) => cohort.learners);
};

const populateTeamsWithLearners = (teams) => {
  const learnerGetters = teams.map((team) => User.findAll({
    where: { id: { [Sequelize.Op.in]: team.learners } },
    attributes: { exclude: ['profile'] },
    raw: true,
  }).then((learners) => {
    let updatedLearners = addLearnerPaths(learners);
    team.learners = updatedLearners;
    return team;
  }));
  return Promise.all(learnerGetters);
};

export const getMilestoneTeams = (milestone_id) => Team.findAll({
  where: {
    cohort_milestone_id: milestone_id,
  },
  raw: true,
});

export const getCohortMilestones = (cohort_id) => CohortMilestone.findAll({
  where: { cohort_id },
  include: [Milestone],
});

export const getCohortMilestoneTeams = (cohort_id) => CohortMilestone.findAll({
  where: { cohort_id },
  attributes: ['id'],
  include: [
    {
      model: Team,
      foreignKey: 'cohort_milestone_id',
      attributes: ['learners', 'github_repo_link', 'id'],
    },
  ],
});

export const getCohortMilestoneTeamsBeforeDate = (
  cohort_id,
  before_date,
  after_date,
) => CohortMilestone.findAll({
  where: {
    cohort_id,
    review_scheduled: { [between]: [after_date, before_date] },
  },
  attributes: ['id'],
  include: [
    {
      model: Team,
      foreignKey: 'cohort_milestone_id',
      attributes: ['learners', 'github_repo_link', 'id'],
    },
  ],
});

export const getCohortMilestoneBylearnerId = (learner_id) => Application.findOne({
  where: {
    user_id: learner_id,
  },
}).then((cohort) => getCohortMilestones(cohort.cohort_joining));

export const getOrCreateMilestoneTeams = (milestone_id) => getMilestoneTeams(milestone_id)
  .then((teams) => {
    if (teams.length !== 0) {
      return teams;
    }
    return createMilestoneTeams(milestone_id);
  })
  .then(populateTeamsWithLearners);

// milestone_id=null represents the topics belonging to the program
export const findTopicsForCohortAndMilestone = (
  cohort_id,
  milestone_id = null,
) => Topic.findAll({
  where: { milestone_id },
  raw: true,
  include: [
    {
      model: CohortBreakout,
      where: {
        cohort_id,
        topic_id: Sequelize.literal(
          '"topics"."id"=cohort_breakouts.topic_id',
        ),
      },
      required: false,
    },
  ],
}).then((topics) => Promise.all(
  topics.map((topic) => {
    getChallengesByTopicId(topic.id).then((challenges) => {
      topic.challenges = challenges;
      Promise.all(
        challenges.map((challenge, index) => LearnerChallenge.count({
          where: {
            challenge_id: challenge.id,
          },
          raw: true,
        }).then((count) => {
          topic.challenges[index].dataValues.attemptedCount = count;
        })),
      );
    });
    getResourceByTopic(topic.id).then((resources) => {
      topic.resources = resources;
    });
    return topic;
  }),
));

const populateTeamsWithLearnersWrapper = async ([
  topics,
  programTopics,
  breakouts,
  teams,
]) => {
  teams = await populateTeamsWithLearners(teams);
  return [topics, programTopics, breakouts, teams];
};

const getDateRanges = (start, end) => {
  let arr = [];
  let date_arr = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push({ day: new Date(dt).toLocaleDateString(), commits: 0 });
    date_arr.push(new Date(dt).toLocaleDateString());
  }
  return { commit_array: arr, date_array: date_arr };
};

export const populateLearnerStats = async (user_id, cohort_milestone_id) => {
  let team = await getLearnerTeam(cohort_milestone_id, user_id);

  let teamCommitsDayWise;

  if (team) {
    let latestCohortCommit;
    let latestCommitByUser;
    let teamAndUserCommits;
    // Get all commits for team in Milestone
    let milestoneCommits = await getTeamCommitsForMilestone(team.id);
    if (milestoneCommits) {
      // Get first commit Date and Last commit date
      let commitDates = milestoneCommits.map((eachUser) => {
        let repoCommits = eachUser.repository_commits;
        let commitDate = repoCommits.map((a) => {
          if (a.commit) {
            return a.commit.commit_date;
          }
          return null;
        });
        return commitDate;
      });
      let allCommitDates = commitDates.flat(1).filter((e) => e);
      allCommitDates.sort((a, b) => {
        let c = moment(a);
        let d = moment(b);
        return c - d;
      });
      let firstCommit = moment(allCommitDates[0]);
      let lastCommit = moment(allCommitDates[allCommitDates.length - 1]);
      // let diffDates = firstCommit.diff(lastCommit, 'days');
      let diffCurrent = moment().diff(lastCommit, 'days');

      let start_date;
      let end_date;
      if (diffCurrent < 7) {
        end_date = moment();
        start_date = moment().subtract(6, 'days');
      } else {
        end_date = lastCommit;
        start_date = moment(lastCommit).subtract(6, 'days');
      }

      let weekDateRange = getDateRanges(start_date, end_date);
      let milestoneDateRange = getDateRanges(
        moment(firstCommit).subtract(2, 'days'),
        lastCommit,
      );

      let userCommitsDayWise = [];
      teamCommitsDayWise = JSON.parse(
        JSON.stringify(milestoneDateRange.commit_array),
      );
      milestoneCommits.map((eachUser) => {
        let repoCommits = eachUser.repository_commits;
        let author;
        try {
          author = repoCommits[0].commit.author;
        } catch (err) {
          if (repoCommits.length > 1) {
            author = repoCommits[1].commit.author;
          }
        }

        let individualUserCommits = {
          gitUsername: author,
          user_id: eachUser.user_id,
          userCommitsDayWise: JSON.parse(
            JSON.stringify(milestoneDateRange.commit_array),
          ),
        };

        repoCommits.map((eachCommit) => {
          if (eachCommit.commit) {
            let commitDate = new Date(
              eachCommit.commit.commit_date,
            ).toLocaleDateString();
            // Commits for week for Learner
            if (user_id === eachUser.user_id) {
              let weekCommittedIndex = weekDateRange.date_array.indexOf(
                commitDate,
              );
              try {
                weekDateRange.commit_array[weekCommittedIndex].commits += 1;
              } catch (err) {
                console.warn('No commits for given week');
              }
            }

            // Commits for first to last committed date
            try {
              let committedIndex = milestoneDateRange.date_array.indexOf(
                commitDate,
              );
              individualUserCommits.userCommitsDayWise[
                committedIndex
              ].commits += 1;

              teamCommitsDayWise[committedIndex].commits += 1;
            } catch (err1) {
              console.warn('No commits for given week');
            }
          }
        });
        userCommitsDayWise.push(individualUserCommits);
      });

      latestCohortCommit = await getLatestCommitInCohort(cohort_milestone_id);
      latestCommitByUser = await getRecentCommitByUser(user_id);
      teamAndUserCommits = await getTotalTeamAndUserCommitsCount(
        user_id,
        team.id,
      );
      let stats = {
        lastWeekCommitsInRepoDayWise: weekDateRange.commit_array,
        userCommitsDayWise,
        teamCommitsDayWise,
        latestCohortCommit,
        latestCommitByUser,
        teamAndUserCommits,
      };
      return stats;
    }
  }
  throw new NoMilestoneCommits('No commits in Cohort Milestone');
};

export const findBreakoutsForMilestone = async (
  cohort_id,
  milestone_id,
  cohortMilestoneId,
) => {
  let breakouts = await getAllBreakoutsInCohortMilestone(
    cohort_id,
    milestone_id,
    cohortMilestoneId,
  );
  return breakouts.filter((breakout) => breakout != null);
};

// TODO: Add filters here for Milestone and see if it solves bug
export const getLiveMilestones = (program, cohort_duration) => {
  const now = Sequelize.literal('NOW()');
  let nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  return CohortMilestone.findAll({
    order: [[Cohort, 'duration', 'ASC']],
    where: {
      '$cohort.status$': 'live',
      release_time: { [lte]: now },
      review_scheduled: { [between]: [now, nextSevenDays] },
      '$cohort.program_id$': program,
      '$cohort.duration$': cohort_duration,
      '$milestone.starter_repo$': {
        [Sequelize.Op.ne]: null,
      },
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};

export const getPreviousCohortMilestone = (cohort_milestone_ids) => CohortMilestone.findAll({
  order: [[Cohort, 'duration', 'ASC']],
  where: {
    id: { [Sequelize.Op.in]: cohort_milestone_ids },
    '$cohort.status$': 'live',
    '$milestone.starter_repo$': {
      [Sequelize.Op.ne]: null,
    },
  },
  include: [Cohort, Milestone],
  raw: true,
});

export const getCohortLiveMilestones = (
  program,
  cohort_duration,
  cohort_id,
) => {
  const now = Sequelize.literal('NOW()');
  let nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  return CohortMilestone.findAll({
    order: [[Cohort, 'duration', 'ASC']],
    where: {
      cohort_id,
      '$cohort.status$': 'live',
      release_time: { [lte]: now },
      review_scheduled: { [between]: [now, nextSevenDays] },
      '$cohort.program_id$': program,
      '$cohort.duration$': cohort_duration,
      '$milestone.starter_repo$': {
        [Sequelize.Op.ne]: null,
      },
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};

export const getMilestoneBreakoutsTeams = async (milestone, cohort_id) => {
  const { milestone_id, id } = milestone;
  const cohortMilestonePromises = [
    findTopicsForCohortAndMilestone(cohort_id, milestone_id),
    findTopicsForCohortAndMilestone(cohort_id),
    findBreakoutsForMilestone(cohort_id, milestone_id, id),
  ];
  if (milestone['milestone.starter_repo']) {
    cohortMilestonePromises.push(createMilestoneTeams(id));
  }
  // else {
  //   // If starter-repo is not present, create breakouts for all
  //   let learnerIds = await getLearnersForCohort(cohort_id);
  //   await createLearnerBreakoutsForMilestone(learnerIds, id, 'common');
  // }
  let cohortData = await Promise.all(cohortMilestonePromises);
  if (milestone['milestone.starter_repo']) {
    cohortData = await populateTeamsWithLearnersWrapper(cohortData);
  }
  const [topics, programTopics, breakouts, teams] = cohortData;
  milestone.topics = topics;
  milestone.programTopics = programTopics;
  milestone.teams = teams;
  milestone.breakouts = breakouts;
  return milestone;
};

export const getMilestoneData = async (milestone, cohort_id) => {
  const now = Sequelize.literal('NOW()');
  if (!milestone) {
    milestone = await CohortMilestone.findOne({
      order: [[Sequelize.col('release_time'), Sequelize.literal('DESC')]],
      where: {
        release_time: {
          [lte]: now,
        },
        cohort_id,
      },
      include: [Cohort, Milestone],
      raw: true,
    });
  }
  milestone = await getMilestoneBreakoutsTeams(milestone, cohort_id);
  return milestone;
};

export const getLiveCohortMilestone = (cohort_id) => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findOne({
    order: Sequelize.col('release_time'),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
      cohort_id,
    },
    include: [Milestone, Cohort],
    raw: true,
  });
};

export const getLiveCohortMilestoneBylearnerId = (learner_id) => Application.findOne({
  where: {
    user_id: learner_id,
  },
}).then((cohort) => getLiveCohortMilestone(cohort.cohort_joining));

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
  }).then(async (milestone) => {
    if (!milestone) return milestone;
    milestone = await getMilestoneBreakoutsTeams(milestone, cohort_id);
    return milestone;
  });
};

export const populateMilestone = async (milestone, user_id) => {
  let { cohort_id } = milestone;
  milestone = await getMilestoneData(milestone, cohort_id);
  return milestone;
};

export const getCurrentCohortMilestone = async (cohort_id) => {
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
    include: [Team],
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
  }).then(async (milestone) => {
    milestone = await getMilestoneData(milestone, cohort_id);
    return milestone;
  });
};

export const getCohortMilestoneById = (milestone_id, user_id) => CohortMilestone.findOne({
  where: {
    id: milestone_id,
  },
  include: [Cohort, Milestone],
  raw: true,
}).then((milestone) => populateMilestone(milestone, user_id));

function* calculateReleaseTime(
  cohort_start,
  pending,
  cohort_duration,
  cohort_program,
  milestones,
) {
  const DAY_MSEC = 86400000;
  let milestone_duration = 0;
  // Need better logic for assessments
  const ASSESSMENT_MILESTONES = [
    'b6202bb4-41dd-4f7e-8a0f-003c4b3909bb',
    'a1855024-6caa-478d-8093-5af69219229e',
    '4a39a84b-b874-4ff8-b90c-c0c76883d4ad',
  ];
  const CAPSTONE_MILESTONES = [
    'e1384e68-ae92-4049-98ef-bba7aae0bf4a',
    '45925f89-5b3f-48b5-b355-dcaaf5d52207',
  ];
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
    start.setDate(
      cohort_start.getDate() + ((6 + 7 - cohort_start.getDay()) % 7),
    );
    // Calculate Monday 23:59:59
    end = new Date(+start + DAY_MSEC * 2.99999);
  } else {
    // Calculate first Monday 00:00:00
    start.setDate(
      cohort_start.getDate() + ((1 + 7 - cohort_start.getDay()) % 7),
    );
    // Calculate Monday 23:59:59
    end = new Date(+start + DAY_MSEC * 0.99999);
  }

  while (pending--) {
    if (pending === 0) {
      // Calculate next friday
      end.setDate(
        start.getDate()
          + ((5 + milestone_duration - cohort_start.getDay())
            % milestone_duration),
      );
    }
    yield { start, end };
    start.setTime(+end + 1000);
    let currentilestone = ASSESSMENT_MILESTONES.indexOf(
      milestones[milestones.length - pending],
    );
    let capstoneMilestones = CAPSTONE_MILESTONES.indexOf(
      milestones[milestones.length - pending],
    );
    if (currentilestone > -1) {
      milestone_duration = 7;
    }
    if (capstoneMilestones > -1) {
      milestone_duration = 14;
    }
    end.setTime(+end + DAY_MSEC * milestone_duration);
  }
}

export const createCohortMilestones = (cohort_id) => Cohort.findByPk(cohort_id, {
  include: [Program],
  raw: true,
}).then((cohort) => {
  const milestones = cohort['program.milestones'];
  const cohort_duration = cohort.duration;
  const cohort_program_id = cohort.program_id;
  const release = calculateReleaseTime(
    cohort.start_date,
    milestones.length,
    cohort_duration,
    cohort_program_id,
    milestones,
  );
  const cohort_milestones = milestones.map((milestone_id) => {
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
export const markMilestoneReview = (id) => CohortMilestone.update(
  {
    review_time: Sequelize.literal('now()'),
  },
  {
    where: { id, review_time: null },
    returning: true,
    raw: true,
  },
).then((results) => (results[1][0] ? results[1][0] : Promise.reject('Review could not be saved')));

export const getCohortMilestone = (cohort_id, milestone_id) => CohortMilestone.findOne({
  where: { cohort_id, milestone_id },
});

export const getCohortMilestoneIds = (cohort_id) => CohortMilestone.findAll({
  where: { cohort_id },
  attributes: ['id'],
  raw: true,
});

export const getAssessmentCohorts = (milestone, duration, program) => {
  const nextWeek = moment().add(7, 'days').toDate();
  return CohortMilestone.findAll({
    order: Sequelize.col('review_scheduled'),
    where: {
      release_time: { [lte]: nextWeek },
      review_scheduled: { [gt]: nextWeek },
      '$cohort_milestones.milestone_id$': {
        [Sequelize.Op.in]: [milestone],
      },
      '$cohort.status$': 'live',
      '$cohort.program_id$': program,
      '$cohort.duration$': duration,
    },
    include: [
      {
        model: Cohort,
      },
    ],
    raw: true,
  });
};
