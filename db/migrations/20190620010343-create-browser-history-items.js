const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('browser_history_items', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    browser_url_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    useragent: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('browser_history_items'),
};

export default migration;
