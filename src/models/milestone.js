import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
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
  duration: {
    type: Sequelize.INTEGER,
  },
  alias: {
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

export const getMilestonesByProgram = (program, attributes, topics) => {
  topics = (topics === 'true');
  let topicsAtrributes;
  if (!topics) {
    topicsAtrributes = [];
  }
  if (attributes) {
    return Milestone.findAll({
      where: {
        '$topics.program$': program,
      },
      attributes,
      include: [{
        model: Topic,
        required: topics,
        attributes: topicsAtrributes,
      }],
    });
  }
  return Milestone.findAll({
    where: {
      '$topics.program$': program,
    },
    include: [{
      model: Topic,
      required: topics,
      attributes: topicsAtrributes,
    }],
  });
};

export const getMilestonesByName = name => Milestone.findAll(
  { where: { name } },
);

export const getMilestonesById = id => Milestone.findOne(
  { where: { id } },
);

export const createMilestones = (name, prerequisite_milestones,
  problem_statement, learning_competencies, releases, starter_repo,
  alias, duration, updated_by) => Milestone.create(
  {
    id: uuid(),
    name,
    prerequisite_milestones,
    problem_statement,
    learning_competencies,
    releases,
    starter_repo,
    alias,
    duration,
    updated_by,
    created_at: Date.now(),
  },
);

export const updateMilestones = (id,
  name, problem_statement, starter_repo, user_id,
  releases, learning_competencies, prerequisite_milestones, guidelines,
  alias, duration) => Milestone.findOne({
  where: {
    id,
  },
})
  .then((milestone) => {
    if (milestone.updated_by !== null) {
      milestone.updated_by.push(user_id);
    } else {
      milestone.updated_by = [user_id];
    }
    return Milestone.update({
      name,
      updated_by: milestone.updated_by,
      problem_statement,
      starter_repo,
      releases,
      learning_competencies,
      prerequisite_milestones,
      guidelines,
      alias,
      duration,
    }, {
      where: {
        id,
      },
    });
  });

export const deleteMilestones = (id) => Milestone.destroy(
  { where: { id } },
);
