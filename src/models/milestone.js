import Sequelize from 'sequelize';
import uuid from 'uuid';
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
  starter_repo: Sequelize.STRING,
  releases: Sequelize.JSON,
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_by: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
    ),
    allowNull: true,
  },
});

export const getMilestoneDetails = milestone_id => Milestone.findByPk(milestone_id, {
  include: [Topic],
});

export const getAllMilestones = () => Milestone.findAll({});

export const getMilestonesByName = name => Milestone.findAll(
  { where: { name } },
);

export const getMilestonesById = id => Milestone.findOne(
  { where: { id } },
);

export const createMilestones = (name, prerequisite_milestones,
  problem_statement, learning_competencies, releases, starter_repo) => Milestone.create(
  {
    id: uuid(),
    name,
    prerequisite_milestones,
    problem_statement,
    learning_competencies,
    releases,
    starter_repo,
    created_at: Date.now(),
  },
);

export const updateMilestones = (id,
  name, problem_statement, starter_repo, user_id,
  releases, learning_competencies, prerequisite_milestones, guidelines) => Milestone.find({
  where: {
    id,
  },
})
  .then((milestone) => {
    milestone.updated_by.push(user_id);
    milestone.update({
      name,
      updated_by: milestone.updated_by,
      problem_statement,
      starter_repo,
      releases,
      learning_competencies,
      prerequisite_milestones,
      guidelines,
    }, {
      where: {
        id,
      },
    });
  });


export const deleteMilestones = (id) => Milestone.destroy(
  { where: { id } },
);
