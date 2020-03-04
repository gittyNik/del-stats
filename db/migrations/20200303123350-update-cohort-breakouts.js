'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('cohort_breakouts', 'breakout_template_id', {
            type: Sequelize.UUID,
            references: { model: 'breakout_templates' },
        }, { transaction: t })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('cohort_breakouts', 'breakout_template_id', { transaction: t })
      ]);
    });
  }
};