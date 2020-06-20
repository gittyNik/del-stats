import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import { User } from './user';
import { Challenge } from './challenge';
import { SocialConnection, PROVIDERS } from './social_connection';
import { LearnerChallenge } from './learner_challenge';

export const LearnerGithubChallenge = db.define('learner_github_challenges', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    default: Sequelize.UUIDV4,
  },
  learner_challenge_id: {
    type: Sequelize.UUID,
    references: { model: 'learner_challenges' },
  },
  cohort_milestone_id: {
    type: Sequelize.UUID,
  },
  number_of_lines: Sequelize.INTEGER,
  commits: Sequelize.INTEGER,
  repository_commits: Sequelize.ARRAY(Sequelize.JSON),
  last_committed_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

const { gt, gte } = Sequelize.Op;

export const getLastUpdatedChallengeUpdatedDate = (
  user_id,
) => LearnerGithubChallenge.findOne({
  where: {
    '$learner_challenge.learner_id$': user_id,
  },
  include: [
    {
      model: LearnerChallenge,
      attributes: ['learner_id'],
      required: false,
    },
  ],
  order: [
    ['updated_at', 'DESC'],
  ],
  required: true,
  raw: true,
});

export const getLastUpdatedChallengeInCohort = (
  cohort_milestone_id,
) => LearnerGithubChallenge.findOne({
  where: {
    cohort_milestone_id,
    commits: { [gt]: 0 },
  },
  order: [
    ['last_committed_at', 'DESC'],
  ],
  required: true,
  raw: true,
});

export const getChallengesForCohortMilestone = (
  user_id,
  cohort_milestone_id,
) => LearnerGithubChallenge.findAll({
  attributes: [
    'learner_challenge.learner_id',
    [Sequelize.fn('sum', Sequelize.col('commits')), 'nocommits'],
    [Sequelize.fn('sum', Sequelize.col('number_of_lines')), 'nolines'],
    [Sequelize.fn('count', Sequelize.col('cohort_milestone_id')), 'count'],
  ],
  group: ['learner_challenge.learner_id', 'cohort_milestone_id'],
  where: {
    cohort_milestone_id,
    '$learner_challenge.learner_id$': user_id,
    commits: { [gt]: 0 },
  },
  include: [
    {
      model: LearnerChallenge,
      attributes: ['learner_id'],
      required: false,
    },
  ],
  raw: true,
});

export const getTotalChallengeCommitsForCohort = user_id => LearnerGithubChallenge.findAll({
  attributes: [
    'learner_challenge.learner_id',
    [Sequelize.fn('sum', Sequelize.col('commits')), 'nocommits'],
    [Sequelize.fn('sum', Sequelize.col('number_of_lines')), 'nolines']],
  group: ['learner_challenge.learner_id'],
  where: {
    '$learner_challenge.learner_id$': user_id,
  },
  include: [
    {
      model: LearnerChallenge,
      attributes: ['learner_id'],
      // include: [{
      //   model: User,
      //   attributes: ['name'],
      // }],
      required: false,
    },
  ],
  raw: true,
  order: Sequelize.literal('nocommits DESC'),
});


export const getAllLearnerGithubDataChallenge = (
  after_date = '2020-06-10 00:00:00+00',
) => LearnerGithubChallenge.findAll({
  where: {
    created_at: { [gte]: after_date },
  },
  order: [
    ['time_scheduled', 'ASC'],
  ],
  include: [
    {
      model: User,
      include: [
        {
          model: SocialConnection,
          attributes: ['username', 'access_token'],
          where: {
            provider: PROVIDERS.GITHUB,
          },
        }],
      attributes: ['name'],
    }, Challenge],
});

export const getAllLearnerGithubDataChallengeById = id => LearnerGithubChallenge.findOne(
  {
    where: {
      id,
    },
    include: [
      {
        model: User,
        include: [
          {
            model: SocialConnection,
            attributes: ['username', 'access_token'],
            where: {
              provider: PROVIDERS.GITHUB,
            },
          }],
        attributes: ['name'],
      }, Challenge],
  },
);

export const getLearnerGithubDataByTeam = milestone_team_id => LearnerGithubChallenge.findOne(
  {
    where: {
      team_id: milestone_team_id,
    },
    include: [
      {
        model: User,
        include: [
          {
            model: SocialConnection,
            attributes: ['username', 'access_token'],
            where: {
              provider: PROVIDERS.GITHUB,
            },
          }],
        attributes: ['name'],
      }, Challenge],
  },
);

export const createOrUpdateLearnerGithubDataForChallenge = (
  learner_challenge_id, no_lines, new_commits,
  last_committed_at, commits_count, cohort_milestone_id,
) => LearnerGithubChallenge.findOne({
  where: {
    learner_challenge_id,
  },
})
  .then((learnerGithub) => {
    if (_.isEmpty(learnerGithub)) {
      return LearnerGithubChallenge.create({
        id: uuid(),
        learner_challenge_id,
        number_of_lines: no_lines,
        repository_commits: new_commits,
        created_at: Date.now(),
        last_committed_at,
        commits: commits_count,
        cohort_milestone_id,
      });
    }

    learnerGithub.repository_commits.push(new_commits);
    return learnerGithub.update({
      number_of_lines: no_lines,
      repository_commits: learnerGithub.repository_commits,
      last_committed_at,
      commits: commits_count,
      cohort_milestone_id,
    }, {
      where: {
        team_id: learner_challenge_id,
      },
    });
  });

export const deleteLearnerGithubDataForChallenge = (
  learner_challenge_id,
) => LearnerGithubChallenge.destroy(
  {
    where: {
      learner_challenge_id,
    },
  },
);

export default LearnerGithubChallenge;
