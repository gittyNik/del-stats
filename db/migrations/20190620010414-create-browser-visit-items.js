const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('browser_visit_items', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    browser_url_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'browser_history_items', key: 'browser_url_id' },
    },
    visited_timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    visit_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    transition: {
      type: Sequelize.STRING,
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
  down: queryInterface => queryInterface.dropTable('browser_visit_items'),
};

export default migration;
