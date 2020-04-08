import Sequelize from 'sequelize';
import db from '../database';
import { Topic } from './topic';

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
  starter_repo: Sequelize.STRING
});

export const getMilestoneDetails = milestone_id => Milestone.findByPk(milestone_id, {
  include: [Topic],
});
