const migration = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.removeColumn('job_postings', 'attached_assignment', { transaction }),
    queryInterface.addColumn('job_applications', 'attached_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.removeColumn('job_applications', 'attached_assignment', { transaction }),
    queryInterface.addColumn('job_postings', 'attached_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction }),
  ])),
};

export default migration;
