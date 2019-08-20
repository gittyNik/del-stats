const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('job_applications', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('job_applications'),
};

export default migration;
