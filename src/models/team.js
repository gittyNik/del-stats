import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import faker from 'faker';
import db from '../database';
import { CohortMilestone } from './cohort_milestone';

export const Team = db.define('milestone_learner_teams', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  cohort_milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'cohort_milestones', key: 'id' },
  },
  learners: Sequelize.ARRAY(Sequelize.UUID),
  github_repo_link: Sequelize.STRING,
  product_demo_link: Sequelize.STRING,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('now()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('now()'),
  },
});

export const splitTeams = users => {
  const teams = [];
  const shuffled = _.shuffle(users);

  while (shuffled.length > 4) {
    teams.push(shuffled.splice(-3));
  }

  if (shuffled.length > 0) teams.push(shuffled);

  return teams;
};

export const createMilestoneTeams = cohort_milestone_id => CohortMilestone.findByPk(cohort_milestone_id)
  .then(m => m.getUsers())
  .then(splitTeams)
  .then(teams => Team.bulkCreate(teams.map(learners => ({
    id: uuid(),
    name: faker.commerce.productName(),
    cohort_milestone_id,
    learners,
  }))));
