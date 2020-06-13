import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import { User } from './user';
import { Team } from './team';
import { Cohort } from './cohort';
import { SocialConnection, PROVIDERS } from './social_connection';

const { gte } = Sequelize.Op;

export const LearnerGithubMilestones = db.define('learner_github_milestones', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    default: Sequelize.UUIDV4,
  },
  user_id: {
    type: Sequelize.UUID,
    references: { model: 'users' },
  },
  team_id: {
    type: Sequelize.UUID,
    references: { model: 'milestone_learner_teams' },
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
});

LearnerGithubMilestones.belongsTo(User, { foreignKey: 'user_id' });

export const getAllLearnerGithubDataMilestone = (
  after_date = '2020-06-10 00:00:00+00',
) => LearnerGithubMilestones.findAll({
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
    }, Team],
});

export const getAllCohortGithubMilestoneData = cohort_id => LearnerGithubMilestones.findAll(
  {
    include: [
      {
        model: User,
        include: [
          {
            model: Cohort,
            attributes: [],
            through: { where: { id: cohort_id } },
          }],
        attributes: ['name'],
      },
    ],
  },
);

export const getLastUpdatedMilestoneCommit = (user_id,
  cohort_milestone_id) => LearnerGithubMilestones.findOne({
  where: {
    user_id,
    cohort_milestone_id,
  },
  attributes: ['last_committed_at'],
  order: [
    ['last_committed_at', 'DESC'],
  ],
});

export const getTotalLearnerCommitsForCohort = cohort_id => LearnerGithubMilestones.findAll({
  attributes: [
    'user_id',
    [Sequelize.fn('sum', Sequelize.col('commits')), 'noOfCommits'],
    [Sequelize.fn('sum', Sequelize.col('number_of_lines')), 'noOfLines']],
  group: ['user_id'],
  include: [
    {
      model: User,
      include: [
        {
          model: Cohort,
          attributes: [],
          through: { where: { id: cohort_id } },
        }],
      attributes: ['name'],
    },
  ],
  raw: true,
  order: Sequelize.literal('total DESC'),
});

export const getAllLearnerGithubDataMilestoneById = id => LearnerGithubMilestones.findOne(
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
      }, Team],
  },
);

export const getLearnerGithubDataByTeam = milestone_team_id => LearnerGithubMilestones.findOne(
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
      }, Team],
  },
);

export const createOrUpdteLearnerGithubDataForMilestone = (user_id,
  team_id, new_commit_count,
  new_commits, cohort_milestone_id,
  commits_count,
  last_committed_at) => LearnerGithubMilestones.findOne({
  where: {
    user_id,
    cohort_milestone_id,
  },
})
  .then((learnerGithub) => {
    if (_.isEmpty(learnerGithub)) {
      return LearnerGithubMilestones.create({
        id: uuid(),
        user_id,
        team_id,
        number_of_lines: new_commit_count,
        repository_commits: new_commits,
        cohort_milestone_id,
        commits: commits_count,
        created_at: Date.now(),
        last_committed_at,
      });
    }
    let totalLines = learnerGithub.number_of_lines + new_commit_count;
    let commitsCount = learnerGithub.commits + commits_count;
    learnerGithub.repository_commits.push(new_commits);
    return learnerGithub.update({
      number_of_lines: totalLines,
      repository_commits: learnerGithub.repository_commits,
      commits: commitsCount,
      last_committed_at,
    }, {
      where: {
        user_id,
        team_id,
      },
    });
  });

export const deleteLearnerGithubDataForMilestone = (user_id) => LearnerGithubMilestones.destroy(
  {
    where: {
      user_id,
    },
  },
);

export default LearnerGithubMilestones;
