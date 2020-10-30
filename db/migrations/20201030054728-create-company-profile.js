const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('company_profile', {
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
    recruiters: {
      type: Sequelize.ARRAY(Sequelize.UUID),
    },
  }),
  down: queryInterface => queryInterface.dropTable('company_profile'),
};

export default migration;
