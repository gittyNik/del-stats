const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('resource_votes', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    resource_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'resources', key: 'id' },
    },
    vote: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('resource_votes'),
};

export default migration;
