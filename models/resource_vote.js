'use strict';
module.exports = (sequelize, DataTypes) => {
  const resource_vote = sequelize.define('resource_vote', {
    id: DataTypes.UUID
  }, {});
  resource_vote.associate = function(models) {
    // associations can be defined here
  };
  return resource_vote;
};