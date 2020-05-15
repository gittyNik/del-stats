import Sequelize from 'sequelize';
import db from '../database';

export const Rubrics = db.define('rubrics', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'milestones', key: 'id' },
  },
  rubric_name: {
    type: Sequelize.STRING,
  },
  program: {
    type: Sequelize.STRING,
    references: { model: 'program', key: 'name' },
  },
  rubric_parameters: {
    type: Sequelize.JSON,
  },
});

export const getAllRubrics = () => Rubrics.findAll({});

export const getRubricsByProgram = program => Rubrics.findAll(
  { where: { program } },
);

export const getReviewsByMilestone = (milestone_id, program) => Rubrics.findAll(
  { where: { milestone_id, program } },
);


export const getRubricsById = id => Rubrics.findOne(
  { where: { id } },
);
