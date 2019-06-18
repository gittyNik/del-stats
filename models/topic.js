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
    type:DataTypes.TEXT,
  },
  program:{
    type:DataTypes.STRING,
    defaultValue:"tep"
  },
});

module.exports = Topic
