import Sequelize from 'sequelize';
import db from '../database';

const Cohort = db.define('cohorts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  learners: Sequelize.ARRAY(Sequelize.UUID),
  program_id: Sequelize.STRING,
  start_date: Sequelize.DATE,
  learning_ops_manager: Sequelize.UUID,
})
export default Cohort;
