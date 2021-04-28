const request_status = [
  'accepted',
  'rejected',
  'retained',
];

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
      status: {
        type: Sequelize.ENUM(...request_status),
      },
      updated_by: {
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cohort_breakout_applied_catalysts');
  },
};
