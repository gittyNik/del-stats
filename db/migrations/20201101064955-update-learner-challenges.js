const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('learner_challenges', 'job_application_id', {
      type: Sequelize.UUID,
      references: { model: 'job_applications', key: 'id' },
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('learner_challenges', 'job_application_id', { transaction }),
  ])),
};

export default migration;
