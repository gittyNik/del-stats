const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('job_applications', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    job_posting_id: {
      type: Sequelize.UUID,
      references: { model: 'job_postings', key: 'id' },
    },
    applicant_id: {
      type: Sequelize.UUID,
      references: { model: 'portfolios', key: 'id' },
    },
    review: Sequelize.TEXT,
    status: Sequelize.STRING,
    offer_details: Sequelize.TEXT,
    applicant_feedback: Sequelize.TEXT,
    counsellor_notes: Sequelize.TEXT,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('job_applications'),
};

export default migration;
