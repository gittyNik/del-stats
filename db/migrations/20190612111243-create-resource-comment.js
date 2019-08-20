module.exports = {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('resource_comments'),
};
