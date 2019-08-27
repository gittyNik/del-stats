const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('cohort_assessments', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    cohort_id: {
      type: Sequelize.UUID,
      references: { model: 'cohorts', key: 'id' },
    },
    assessment_id: {
      type: Sequelize.UUID,
      references: { model: 'assessments', key: 'id' },
    },
    catalyst_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    location: Sequelize.STRING,
    time_scheduled: Sequelize.DATE,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('cohort_assessments'),
};

export default migration;
