const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('job_applications', 'updated_by', Sequelize.ARRAY(Sequelize.JSON), { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('job_applications', 'updated_by', { transaction }),
  ])),
};

export default migration;
