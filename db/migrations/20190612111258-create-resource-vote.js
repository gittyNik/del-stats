module.exports = {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('resource_votes'),
};
