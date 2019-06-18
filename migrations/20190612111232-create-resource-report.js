module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('resource_reports', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      resource_id: {
        type: Sequelize.UUID,
        references:{ model: 'resources', key: 'id' }
      },
      reports: {
        type: Sequelize.STRING,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('resource_reports');
  }
};
