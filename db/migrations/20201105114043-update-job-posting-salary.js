const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('job_postings', 'start_range', {
      type: Sequelize.FLOAT,
    }, { transaction }),
    qi.changeColumn('job_postings', 'end_range', {
      type: Sequelize.FLOAT,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('job_postings', 'start_range', {
      type: Sequelize.INTEGER,
    }, { transaction }),
    qi.changeColumn('job_postings', 'end_range', {
      type: Sequelize.INTEGER,
    }, { transaction }),
  ])),
};

export default migration;
