const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('job_applications', 'attached_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('job_applications', 'attached_assignment', { transaction }),
  ])),
};

export default migration;
