'use strict';
module.exports = (sequelize, DataTypes) => {
  const testquestions = sequelize.define('testquestions', {
    question: DataTypes.JSON,
    qtype: DataTypes.STRING
  }, {});
  testquestions.associate = function(models) {
    // associations can be defined here
  };
  return testquestions;
};