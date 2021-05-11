module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cohort_breakout_applied_catalysts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        default: Sequelize.UUIDV4,
      },
      cohort_breakout_id: {
        type: Sequelize.UUID,
      },
      applied_catalyst_id: {
        type: Sequelize.UUID,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cohort_breakout_applied_catalysts');
  },
};
