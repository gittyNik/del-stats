const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('job_postings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('job_postings'),
};

export default migration;
