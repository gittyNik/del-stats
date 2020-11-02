const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.sequelize.query('DROP TYPE IF EXISTS "enum_job_postings_status";', { transaction }),
    qi.addColumn('job_postings', 'company_id', {
      type: Sequelize.UUID,
      references: { model: 'company_profiles', key: 'id' },
    }, { transaction }),
    qi.addColumn('job_postings', 'views', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
    qi.addColumn('job_postings', 'interested', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
    qi.addColumn('job_postings', 'tags', {
      type: Sequelize.ARRAY(Sequelize.UUID),
    }, { transaction }),
    qi.removeColumn('job_postings', 'posted_by', { transaction }),
    qi.addColumn('job_postings', 'posted_by', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
    qi.addColumn('job_postings', 'vacancies', {
      type: Sequelize.INTEGER,
    }, { transaction }),
    qi.addColumn('job_postings', 'attached_assignment', {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }, { transaction }),
    qi.addColumn('job_postings', 'start_range', {
      type: Sequelize.INTEGER,
    }, { transaction }),
    qi.addColumn('job_postings', 'end_range', {
      type: Sequelize.INTEGER,
    }, { transaction }),
    qi.addColumn('job_postings', 'status', {
      type: Sequelize.ENUM(...STATUS),
    }, { transaction }),
    qi.changeColumn('job_postings', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('job_postings', 'company_id', { transaction }),
    qi.removeColumn('job_postings', 'views', { transaction }),
    qi.removeColumn('job_postings', 'interested', { transaction }),
    qi.removeColumn('job_postings', 'tags', { transaction }),
    qi.removeColumn('job_postings', 'posted_by', { transaction }),
    qi.removeColumn('job_postings', 'vacancies', { transaction }),
    qi.removeColumn('job_postings', 'attached_assignment', { transaction }),
    qi.removeColumn('job_postings', 'start_range', { transaction }),
    qi.removeColumn('job_postings', 'end_range', { transaction }),
    qi.removeColumn('job_postings', 'status', { transaction }),
    qi.changeColumn('job_postings', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
  ])),
};

export default migration;
