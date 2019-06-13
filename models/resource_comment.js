'use strict';
module.exports = (sequelize, DataTypes) => {
  const resource_comment = sequelize.define('resource_comment', {
    id: DataTypes.UUID
  }, {});
  resource_comment.associate = function(models) {
    // associations can be defined here
  };
  return resource_comment;
};