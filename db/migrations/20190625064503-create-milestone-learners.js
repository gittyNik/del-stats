const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('milestone_learners', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('milestone_learners'),
};

export default migration;
