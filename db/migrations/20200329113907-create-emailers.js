const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('emailer', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    message_topic: Sequelize.STRING,
    delivery_id: Sequelize.STRING,
    send_on: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    cohort_id: {
      type: Sequelize.UUID,
      references: { model: 'cohorts', key: 'id' },
    },
    message_details: Sequelize.JSON,
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('emailer'),
};

export default migration;
