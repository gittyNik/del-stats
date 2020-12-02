"use strict";

module.exports = {
  up: (iface, Sequelize) =>
    iface.sequelize.transaction((transaction) =>
      Promise.all([
        iface.changeColumn(
          "applications",
          "cohort_joining",
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
          { transaction }
        ),
      ])
    ),

  down: (iface, Sequelize) =>
    iface.sequelize.transaction((transaction) =>
      Promise.all([
        iface.changeColumn(
          "applications",
          "cohort_joining",
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
          { transaction }
        ),
      ])
    ),
};
