const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('job_postings', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: Sequelize.UUID,
      references: { model: 'company_profile', key: 'id' },
    },
    description: Sequelize.TEXT,
    status: {
      type: Sequelize.ENUM(...STATUS),
    },
    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    interested: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    tags: {
      type: Sequelize.UUID,
      references: { model: 'tags', key: 'id' },
    },
    posted_by: {
      type: Sequelize.ARRAY(Sequelize.JSON),
    },
  }),
  down: queryInterface => queryInterface.dropTable('job_postings'),
};

export default migration;
