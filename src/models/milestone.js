import Sequelize from 'sequelize';
import db from '../database';

export const Milestone = db.define('milestones', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  prerequisite_milestones: Sequelize.ARRAY(Sequelize.UUID),
  problem_statement: Sequelize.TEXT,
  learning_competencies: Sequelize.ARRAY(Sequelize.STRING),
  guidelines: Sequelize.TEXT,
});

export default Milestone;
