const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('assessments', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    phase: Sequelize.STRING,
    assessment_rubric: Sequelize.JSON,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('assessments'),
};

export default migration;
