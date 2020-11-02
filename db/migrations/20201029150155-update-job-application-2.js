const APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('job_applications', 'offer_details', {
      type: Sequelize.JSON,
    }, { transaction }),
    qi.addColumn('job_applications', 'status', {
      type: Sequelize.ENUM(...APPLICATION_STATUS),
    }, { transaction }),
    qi.addColumn('job_applications', 'applicant_feedback', Sequelize.JSON, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('job_applications', 'offer_details', { transaction }),
    qi.removeColumn('job_applications', 'status', { transaction }),
    qi.removeColumn('job_applications', 'applicant_feedback', { transaction }),
  ])),
};

export default migration;
