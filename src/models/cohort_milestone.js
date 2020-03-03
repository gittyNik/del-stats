import Sequelize from "sequelize";
import uuid from "uuid/v4";
import db from "../database";
import { Cohort } from "./cohort";
import { CohortBreakout } from "./cohort_breakout";
import { Program } from "./program";
import { Milestone } from "./milestone";
import { Topic } from "./topic";
import { Team, createMilestoneTeams, getLearnerTeamOfMilestone } from "./team";
import { User } from "./user";
import { getChallengesByTopicId } from "./challenge.js";
import {
  getRecentCommitByUser,
} from "../integrations/github/controllers/commits.controller";
import {
  getLatestCommitInCohort,
  getTotalTeamAndUserCommitsCount
} from "../integrations/github/controllers/";
import { getGithubConnecionByUserId } from "./social_connection";
import { weeklyCommitActivityData } from "../integrations/github/controllers";
import _ from "lodash";

export const CohortMilestone = db.define("cohort_milestones", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID
  },
  release_time: Sequelize.DATE,
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: "cohorts", key: "id" }
  },
  milestone_id: {
    type: Sequelize.UUID,
    references: { model: "milestones", key: "id" }
  },
  reviewer_id: {
    type: Sequelize.UUID,
    references: { model: "users", key: "id" }
  },
  review_scheduled: Sequelize.DATE,
  review_time: Sequelize.DATE,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("NOW()")
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("NOW()")
  }
});

const { lte, gt } = Sequelize.Op;

export const getDataForMilestoneName = id =>
  CohortMilestone.findOne({
    where: {
      id
    },
    include: [Cohort, Milestone]
  });

export const getCurrentCohortMilestones = () => {
  const now = Sequelize.literal("NOW()");
  return CohortMilestone.findAll({
    order: Sequelize.col("release_time"),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now }
    },
    include: [Cohort, Milestone]
  });
};

// milestone_id=null represents the topics belonging to the program
const findTopicsForCohortAndMilestone = (cohort_id, milestone_id = null) =>
  Topic.findAll({
    where: { milestone_id },
    raw: true,
    include: [
      {
        model: CohortBreakout,
        where: {
          cohort_id,
          topic_id: Sequelize.literal('"topics"."id"=cohort_breakouts.topic_id')
        },
        required: false
      }
    ]
  }).then(async topics => {
    for (let i = 0; i < topics.length; i++) {
      topics[i].challenges = await getChallengesByTopicId(topics[i].id);
    }
    return topics;
  });

const populateTeamsWithLearnersWrapper = async ([
  topics,
  programTopics,
  teams,
  stats
]) => {
  teams = await populateTeamsWithLearners(teams);
  return [topics, programTopics, teams];
};



const populateLearnerStats = (
  user_id,
  cohort_id,
  cohort_milestone_id
) => async ([topics, programTopics, teams]) => {
  let socialConnection = await getGithubConnecionByUserId(user_id);
  let Teams = _.filter(teams, team => _.includes(team.learners, user_id));

  let lastWeekCommitsInRepoDayWise = await weeklyCommitActivityData(
    Teams[0].github_repo_link
  );
  let u = await userAndTeamCommitsDayWise(
    user_id,
    Teams[0].github_repo_link,
    socialConnection.username
  );

  let userCommitsDayWise = u.userCommitsDayWise;
  let teamCommitsDayWise = u.teamCommitsDayWise;
  let stats = {
    lastWeekCommitsInRepoDayWise,
    userCommitsDayWise,
    teamCommitsDayWise
  };

  return [topics, programTopics, teams, stats];
};

export const getCurrentMilestoneOfCohort = async (cohort_id, user_id) => {
  const now = Sequelize.literal("NOW()");
  return CohortMilestone.findOne({
    order: Sequelize.col("release_time"),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
      cohort_id
    },
    include: [Cohort, Milestone],
    raw: true
  }).then(milestone => {
    if (!milestone) return milestone;
    const { milestone_id, id } = milestone;
    return Promise.all([
      findTopicsForCohortAndMilestone(cohort_id, milestone_id),
      findTopicsForCohortAndMilestone(cohort_id),
      createMilestoneTeams(id),
    ])
      .then(populateTeamsWithLearnersWrapper)
      .then(populateLearnerStats(user_id, cohort_id, milestone.id))
      .then(([topics, programTopics, teams, stats]) => {
        console.log(
          `Milestone topics: ${topics.length}, Program topics: ${programTopics.length} Stats: ${stats}`
        );
        milestone.topics = topics;
        milestone.programTopics = programTopics;
        milestone.teams = teams;
        milestone.stats = stats;
        return milestone;
      });
  });
};

function* calculateReleaseTime(cohort_start, pending) {
  const DAY_MSEC = 86400000;
  const start = new Date(cohort_start);
  start.setHours(0, 0, 0, 0);
  // Calculate first Monday
  start.setDate(cohort_start.getDate() + ((1 + 7 - cohort_start.getDay()) % 7));
  // Calculate Tuesday 6 pm
  const end = new Date(+start + DAY_MSEC * 1.75);

  while (pending--) {
    if (pending === 0) {
      // Calculate next friday
      end.setDate(start.getDate() + ((5 + 7 - cohort_start.getDay()) % 7));
    }
    yield { start, end };
    start.setTime(+end + DAY_MSEC / 4);
    end.setTime(+end + DAY_MSEC * 7);
  }
}

export const createCohortMilestones = cohort_id =>
  Cohort.findByPk(cohort_id, {
    include: [Program],
    raw: true
  }).then(cohort => {
    const milestones = cohort["program.milestones"];
    const release = calculateReleaseTime(cohort.start_date, milestones.length);
    const cohort_milestones = milestones.map(milestone_id => {
      const { value } = release.next();

      return {
        id: uuid(),
        release_time: new Date(value.start),
        cohort_id,
        milestone_id,
        review_scheduled: new Date(value.end)
      };
    });

    return CohortMilestone.bulkCreate(cohort_milestones);
  });

// TODO: update reviewer_id after authentication is done
export const markMilestoneReview = id =>
  CohortMilestone.update(
    {
      review_time: Sequelize.literal("now()")
    },
    {
      where: { id, review_time: null },
      returning: true,
      raw: true
    }
  ).then(results =>
    results[1][0] ? results[1][0] : Promise.reject("Review could not be saved")
  );

CohortMilestone.prototype.getUsers = function getCurrentUsers() {
  return Cohort.findByPk(this.cohort_id).then(cohort => cohort.learners);
};

const populateTeamsWithLearners = teams => {
  const learnerGetters = teams.map(team =>
    User.findAll({
      where: { id: { [Sequelize.Op.in]: team.learners } }
    }).then(learners => {
      team.learners = learners;
      return team;
    })
  );
  return Promise.all(learnerGetters);
};

export const getMilestoneTeams = milestone_id =>
  Team.findAll({
    where: {
      cohort_milestone_id: milestone_id
    },
    raw: true
  });

export const getOrCreateMilestoneTeams = milestone_id => {
  return getMilestoneTeams(milestone_id)
    .then(teams => {
      if (teams.length !== 0) {
        return teams;
      }
      return createMilestoneTeams(milestone_id);
    })
    .then(populateTeamsWithLearners);
};

export const getCohortMilestones = cohort_id => 
  CohortMilestone.findAll({
    where: { cohort_id },
    include: [Milestone]
  })
