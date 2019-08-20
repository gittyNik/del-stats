const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('cohort_assessments', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('cohort_assessments'),
};

export default migration;
