const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('resource_reports', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    resource_id: {
      type: Sequelize.UUID,
      references: { model: 'resources', key: 'id' },
    },
    report: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
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
  down: queryInterface => queryInterface.dropTable('resource_reports'),
};

export default migration;
