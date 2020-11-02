const ASSIGNMENT_STATUS = [
  'sent',
  'accepted',
  'started',
  'completed',
  'reviewed',
];

const OFFER_STATUS = [
  'offered',
  'accepted',
  'candidate-rejected',
  'recruiter-rejected',
];

const INTERIEW_STATUS = [
  'scheduled',
  'live',
  'completed',
  'rescheduled',
  'cancelled',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('job_applications', 'applicant_id', { transaction }),
    qi.removeColumn('job_applications', 'offer_details', { transaction }),
    qi.removeColumn('job_applications', 'status', { transaction }),
    qi.removeColumn('job_applications', 'applicant_feedback', { transaction }),
    qi.addColumn('job_applications', 'portfolio_id', {
      type: Sequelize.UUID,
      references: { model: 'portfolios', key: 'id' },
    }, { transaction }),
    qi.addColumn('job_applications', 'assignment_status', {
      type: Sequelize.ENUM(...ASSIGNMENT_STATUS),
    }, { transaction }),
    qi.addColumn('job_applications', 'interview_status', {
      type: Sequelize.ENUM(...INTERIEW_STATUS),
    }, { transaction }),
    qi.addColumn('job_applications', 'offer_status', {
      type: Sequelize.ENUM(...OFFER_STATUS),
    }, { transaction }),
    qi.addColumn('job_applications', 'assignment_due_date', {
      type: Sequelize.DATE,
    }, { transaction }),
    qi.addColumn('job_applications', 'assignment_sent_date', {
      type: Sequelize.DATE,
    }, { transaction }),
    qi.addColumn('job_applications', 'interview_date', {
      type: Sequelize.DATE,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('job_applications', 'applicant_id', {
      type: Sequelize.UUID,
      references: { model: 'portfolios', key: 'id' },
    }, { transaction }),
    qi.addColumn('job_applications', 'offer_details', Sequelize.TEXT, { transaction }),
    qi.addColumn('job_applications', 'status', Sequelize.STRING, { transaction }),
    qi.addColumn('job_applications', 'applicant_feedback', Sequelize.TEXT, { transaction }),
    qi.removeColumn('job_applications', 'portfolio_id', { transaction }),
    qi.removeColumn('job_applications', 'assignment_status', { transaction }),
    qi.removeColumn('job_applications', 'interview_status', { transaction }),
    qi.removeColumn('job_applications', 'offer_status', { transaction }),
    qi.removeColumn('job_applications', 'assignment_due_date', { transaction }),
    qi.removeColumn('job_applications', 'assignment_sent_date', { transaction }),
    qi.removeColumn('job_applications', 'interview_date', { transaction }),
  ])),
};

export default migration;
