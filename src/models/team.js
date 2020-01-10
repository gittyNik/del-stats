import Sequelize from 'sequelize';
import _ from 'lodash';
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
  review_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,

});

const splitTeams = users => {
  const teams = [];
  const shuffled = _.shuffle(users);

  while (shuffled.length > 4) {
    teams.push(shuffled.splice(-3));
  }

  if (shuffled.length > 0) teams.push(shuffled);

  return teams;
};

export const generateMilestoneTeams = cohort_milestone_id => CohortMilestone.findByPk(cohort_milestone_id)
  .then(cohort_milestone => cohort_milestone.getUsers())
  .then(splitTeams);
