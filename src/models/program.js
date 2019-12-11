import Sequelize from 'sequelize';
import db from '../database';

export const Program = db.define('programs', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  milestones: Sequelize.ARRAY(Sequelize.UUID), // todo: add not null
  duration: Sequelize.INTEGER, // in weeks
  test_series: Sequelize.JSON,
  milestone_review_rubric: Sequelize.JSON,
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

export const updateProgramMilestones = (id, milestones) => Program.update({ milestones }, {
  where: { id },
});
