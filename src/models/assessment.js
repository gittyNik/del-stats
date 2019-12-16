import Sequelize from 'sequelize';
import db from '../database';


export const Assessment = db.define('assessments',{
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  phase: Sequelize.STRING,
  assessment_rubric: Sequelize.JSON,
});

export default Assessment;
