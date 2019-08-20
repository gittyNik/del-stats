const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('cohorts', {
    id: Sequelize.UUID,
    name: Sequelize.STRING,
    location: Sequelize.STRING,
    learners: Sequelize.ARRAY(Sequelize.UUID),
    program_id: {
      type: Sequelize.STRING,
      references: { model: 'programs', key: 'id' },
    },
    start_date: Sequelize.DATE,
    learning_ops_manager: Sequelize.UUID,
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('cohorts'),
};

export default migration;
