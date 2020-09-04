import Sequelize from 'sequelize';
import db from '../database';

const RUBRIC_TYPE = [
  'milestone',
  'core-phase',
  'focus-phase',
];

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
    references: { model: 'programs', key: 'id' },
  },
  rubric_parameters: {
    type: Sequelize.JSON,
  },
  type: {
    type: Sequelize.ENUM(...RUBRIC_TYPE),
    defaultValue: 'milestone',
  },
});

export const getAllRubrics = () => Rubrics.findAll({});

export const getRubricsByProgram = (program, type) => Rubrics.findAll(
  { where: { program, type } },
);

export const getRubricsByMilestone = (
  milestone_id, program, type,
) => db.query('select * from rubrics where program=:program and type=:type and (milestone_id is null or milestone_id=:milestone_id);', {
  model: Rubrics,
  replacements: { program: `${program}`, type: `${type}`, milestone_id: `${milestone_id}` },
}).then(data => data).catch(err => {
  console.error(err);
  throw Error(err);
});

export const getRubricsById = id => Rubrics.findOne(
  { where: { id } },
);

export const createRubrics = (milestone_id, rubric_name,
  program, rubric_parameters, type) => Rubrics.create(
  {
    milestone_id,
    rubric_name,
    program,
    rubric_parameters,
    type,
    created_at: Date.now(),
  },
);

export const updateRubrics = (id, rubric_parameters) => Rubrics.update({
  rubric_parameters,
}, { where: { id } });

export const deleteRubric = (id) => Rubrics.destroy(
  { where: { id } },
);
