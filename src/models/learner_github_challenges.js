import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import { User } from './user';
import { Challenge } from './challenge';
import { SocialConnection, PROVIDERS } from './social_connection';

export const LearnerGithubChallenge = db.define('learner_github_challenges', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
  },
  learner_challenge_id: {
    type: Sequelize.UUID,
    references: { model: 'learner_challenges' },
  },
  number_of_lines: Sequelize.INTEGER,
  repository_commits: Sequelize.ARRAY(Sequelize.JSON),
});

const { gte } = Sequelize.Op;

LearnerGithubChallenge.belongsTo(User, { foreignKey: 'user_id' });

Challenge.belongsTo(LearnerGithubChallenge, { foreignKey: 'learner_challenge_id' });

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

export const createOrUpdteLearnerGithubDataForChallenge = (user_id,
  milestone_team_id, new_commit_count, new_commits) => LearnerGithubChallenge.findOne({
  where: {
    user_id,
    milestone_team_id,
  },
})
  .then((learnerGithub) => {
    if (_.isEmpty(learnerGithub)) {
      LearnerGithubChallenge.create({
        id: uuid(),
        user_id,
        milestone_team_id,
        new_commit_count,
        new_commits,
        created_at: Date.now(),
      });
    }
    let totalCommits = learnerGithub.number_of_lines + new_commit_count;
    learnerGithub.repository_commits.push(new_commits);
    return learnerGithub.update({
      number_of_lines: totalCommits,
      repository_commits: learnerGithub.repository_commits,
    }, {
      where: {
        user_id,
        team_id: milestone_team_id,
      },
    });
  });

export const deleteLearnerGithubDataForChallenge = (user_id) => LearnerGithubChallenge.destroy(
  {
    where: {
      user_id,
    },
  },
);

export default LearnerGithubChallenge;
