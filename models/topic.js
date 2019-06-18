import Sequelize from 'sequelize';
const db =require('../database');

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

module.exports = Topic
