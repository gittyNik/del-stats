

module.exports = {
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
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('programs'),
};
