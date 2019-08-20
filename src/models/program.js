import Sequelize from 'sequelize';
import db from '../database';

const Program = db.define('programs', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  duration: Sequelize.INTEGER, // in weeks
  test_series: Sequelize.JSON,
  milestone_review_rubric: Sequelize.JSON,
});
export default Program;
