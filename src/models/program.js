import Sequelize from 'sequelize';
import db from '../database';

export const Program = db.define('programs', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  milestones: Sequelize.ARRAY(Sequelize.UUID),
  duration: Sequelize.INTEGER, // in weeks
  test_series: Sequelize.JSON,
  milestone_review_rubric: Sequelize.JSON,
});

export const updateProgramMilestones = (id, milestones) => Program.update({ milestones }, {
  where: { id },
});
