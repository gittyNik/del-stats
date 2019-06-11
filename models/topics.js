'use strict';
module.exports = (sequelize, DataTypes) => {
  const Topics = sequelize.define('topics', {
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
    } ,
    program:{
      type:DataTypes.STRING,
    },
    milestone_number: {
      type:DataTypes.INTEGER
    }
  }, {});
  topics.associate = function(models) {
    // associations can be defined here
  };
  return topics;
};