import { JOB_TYPE, JOB_POSTING_EXCLUSIVITY} from '../common/enums';
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
  down: queryInterface => queryInterface.dropTable('job_postings'),
};

export default migration;
