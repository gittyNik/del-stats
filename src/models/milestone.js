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
  prerequisite_milestones: {
    type: Sequelize.ARRAY(Sequelize.UUID),
  },
  program: {
    type: Sequelize.STRING,
  },
  problem_statement: {
    type: Sequelize.TEXT,
  },
  learning_competencies: {
    type: Sequelize.ARRAY(Sequelize.STRING),
  },
  guidelines: {
    type: Sequelize.TEXT,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

Milestone.hasMany(Topic);

export const getMilestoneDetails = milestone_id => Milestone.findByPk(milestone_id, {
  include: [Topic],
});
