const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('slack_channels', {
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
  down: queryInterface => queryInterface.dropTable('slack_channels'),
};

export default migration;
