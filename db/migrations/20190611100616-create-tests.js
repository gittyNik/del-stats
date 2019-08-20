const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('tests', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    application_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    purpose: Sequelize.STRING,
    duration: Sequelize.INTEGER,
    responses: {
      type: Sequelize.ARRAY(Sequelize.JSON),
      allowNull: false,
    },
    sub_time: Sequelize.DATE,
    browser_history: Sequelize.ARRAY(Sequelize.UUID),
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('tests'),
};

export default migration;
