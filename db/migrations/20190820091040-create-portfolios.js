const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('portfolios', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    showcase_projects: Sequelize.ARRAY(Sequelize.STRING),
    fields_of_interest: Sequelize.ARRAY(Sequelize.STRING),
    city_choices: Sequelize.ARRAY(Sequelize.STRING),
    educational_backgroud: Sequelize.STRING,
    experience_level: Sequelize.STRING,
    relevant_experience_level: Sequelize.STRING,
    resume: Sequelize.BLOB,
    review: Sequelize.TEXT,
    reviewed_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    status: Sequelize.STRING,
    hiring_status: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('portfolios'),
};

export default migration;
