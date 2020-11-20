const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(t => Promise.all([
    qi.addColumn('job_postings', 'default_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction: t }),
    qi.removeColumn('job_postings', 'attached_assignment', { transaction: t }),
    qi.addColumn('job_postings', 'attached_assignments', {
      type: Sequelize.ARRAY({
        type: Sequelize.UUID,
        references: { model: 'challenges', key: 'id' },
      }),
    }, { transaction: t }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(t => Promise.all([
    qi.removeColumn('job_postings', 'default_assignment', { transaction: t }),
    qi.removeColumn('job_postings', 'attached_assignments', { transaction: t }),
    qi.addColumn('job_postings', 'attached_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction: t }),
  ])),
};

export default migration;
