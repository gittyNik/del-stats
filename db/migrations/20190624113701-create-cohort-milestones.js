const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('teams', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
    },
    cohort_id: Sequelize.UUID,
    milestone_id: Sequelize.UUID,
    reviewer_id: Sequelize.UUID,
    review_scheduled: Sequelize.DATE,
    review_time: Sequelize.DATE,
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('teams'),
};

export default migration;
