const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('slack_channel', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    cohort_id: {
      type: Sequelize.UUID,
      references: { model: 'cohorts' },
    },
    channels: Sequelize.ARRAY({
      type: Sequelize.STRING,
      allowNUll: false,
    }),

  }),
  down: queryInterface => queryInterface.dropTable('slack_channel'),
};

export default migration;
