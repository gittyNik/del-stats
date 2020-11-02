const STATUS = [
  'active',
  'removed',
];

const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('company_profiles', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    description: Sequelize.TEXT,
    logo: {
      type: Sequelize.STRING,
    },
    website: {
      type: Sequelize.STRING,
    },
    worklife: {
      type: Sequelize.TEXT,
    },
    perks: {
      type: Sequelize.TEXT,
    },
    views: {
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
      type: Sequelize.ARRAY(Sequelize.UUID),
    },
    locations: Sequelize.ARRAY(Sequelize.STRING),
    recruiters: Sequelize.ARRAY(Sequelize.UUID),
    updated_by: Sequelize.ARRAY(Sequelize.JSON),
    status: {
      type: Sequelize.ENUM(...STATUS),
      defaultValue: 'active',
    },
    level_of_candidates: Sequelize.ARRAY(Sequelize.STRING),
    roles: Sequelize.ARRAY(Sequelize.STRING),
  }),
  down: queryInterface => queryInterface.dropTable('company_profile'),
};

export default migration;
