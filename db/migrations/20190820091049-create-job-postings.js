export const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];
export const JOB_POSTING_EXCLUSIVITY = ['all', 'hired', 'non-hired'];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('job_postings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    title: Sequelize.STRING,
    company: Sequelize.STRING,
    description: Sequelize.TEXT,
    job_type: Sequelize.ENUM(...JOB_TYPE),
    salary_range: Sequelize.STRING,
    industry: Sequelize.STRING,
    locations: Sequelize.ARRAY(Sequelize.STRING),
    posted_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    contact_person_details: Sequelize.JSON,
    experience_required: Sequelize.STRING,
    exclusivity: Sequelize.ENUM(...JOB_POSTING_EXCLUSIVITY),
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('job_postings', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_job_postings_job_type";', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_job_postings_exclusivity";', { transaction }),
  ])),
};

export default migration;
