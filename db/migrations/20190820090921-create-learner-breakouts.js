const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('learner_breakouts', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('learner_breakouts'),
};

export default migration;
