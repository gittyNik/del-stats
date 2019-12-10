import Sequelize from 'sequelize';
import db from '../database';

export const Team = db.define('teams', {
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

export default Team;
