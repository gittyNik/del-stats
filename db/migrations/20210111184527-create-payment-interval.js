'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('payment_intervals', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    payment_details_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    intervals: Sequelize.JSON,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }
  }),

  down: (queryInterface) => queryInterface.dropTable('payment_intervals')
};
