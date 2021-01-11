'use strict';

const TYPE = ['upfront', 'loan']

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('payment_details', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    type: Sequelize.ENUM(...TYPE),
    alias: Sequelize.STRING,
    total_fees: Sequelize.INTEGER,
    security_deposit: Sequelize.INTEGER,
    no_of_installments: Sequelize.INTEGER,
    discount: Sequelize.INTEGER,
    discount_amount: Sequelize.INTEGER,
    due_amount: Sequelize.INTEGER,
    installment_1: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_2: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_3: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_4: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_5: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_6: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
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
