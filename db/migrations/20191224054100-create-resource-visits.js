const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('resource_visits', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    resource_id: {
      type: Sequelize.UUID,
      references: { model: 'resources', key: 'id' },
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    source: Sequelize.STRING,
    details: Sequelize.JSON,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('resource_visits'),
};

export default migration;
