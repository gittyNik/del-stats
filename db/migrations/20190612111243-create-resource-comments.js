const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('resource_comments', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    resource_id: {
      type: Sequelize.UUID,
      references: { model: 'resources', key: 'id' },
    },
    comment: {
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
  down: queryInterface => queryInterface.dropTable('resource_comments'),
};

export default migration;
