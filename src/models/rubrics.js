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

export const createRubrics = () => (milestone_id, rubric_name,
  program, rubric_parameters) => Rubrics.create(
  {
    milestone_id,
    rubric_name,
    program,
    rubric_parameters,
    created_at: Sequelize.literal('NOW()'),
  },
);

export const updateRubrics = (id, rubric_parameters) => Rubrics.update({
  rubric_parameters,
}, { where: { id } });


export const deleteRubric = (id) => Rubrics.delete(
  { where: { id } },
);
