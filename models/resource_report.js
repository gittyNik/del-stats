'use strict';
module.exports = (sequelize, DataTypes) => {
  const resource_report = sequelize.define('resource_report', {
    id: DataTypes.UUID
  }, {});
  resource_report.associate = function(models) {
    // associations can be defined here
  };
  return resource_report;
};