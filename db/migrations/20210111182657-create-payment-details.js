'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('payment_details', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    type: Sequelize.STRING,
    alias: Sequelize.STRING,
    total_fees: Sequelize.REAL,
    security_deposit: Sequelize.REAL,
    no_of_installments: Sequelize.INTEGER,
    discount: Sequelize.REAL,
    discount_amount: Sequelize.REAL,
    due_amount: Sequelize.REAL,
    installments: Sequelize.JSON,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }
  }),

  down: (queryInterface) => queryInterface.dropTable('payment_details')
};
