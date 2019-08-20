const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('cohort_milestones', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
    },
    release_time: Sequelize.DATE,
    cohort_id: {
      type: Sequelize.UUID,
      references: { model: 'cohorts', key: 'id' },
    },
    milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'milestones', key: 'id' },
    },
    reviewer_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
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
  down: queryInterface => queryInterface.dropTable('cohort_milestones'),
};

export default migration;
