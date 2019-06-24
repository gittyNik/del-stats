import Sequelize from 'sequelize';
import db from '../database';

const Topic = db.define('topics', {
  id:{
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID
  },
  title:{
    type:Sequelize.STRING,
  },
  description:{
    type:Sequelize.TEXT,
  },
  program:{
    type:Sequelize.STRING,
    defaultValue:"tep"
  },
});

export default Topic;
