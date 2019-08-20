const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('programs', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    location: Sequelize.STRING,
    duration: Sequelize.INTEGER, // in weeks
    test_series: Sequelize.JSON,
    milestone_review_rubric: Sequelize.JSON,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('programs'),
};

export default migration;
