const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('slack_channels', 'cohort_id', {
      type: Sequelize.UUID,
      references: { model: 'cohorts' },
      unique: true,
      allowNull: false,
    }, { transaction }),
    qi.addColumn('slack_channels', 'created_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
    qi.addColumn('slack_channels', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('slack_channels', 'cohort_id', {
      type: Sequelize.UUID,
      references: { model: 'cohorts' },
    }, { transaction }),
    qi.removeColumn('slack_channels', 'created_at', { transaction }),
    qi.removeColumn('slack_channels', 'updated_at', { transaction }),
  ])),
};

export default migration;
