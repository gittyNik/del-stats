module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('browser_visit_items', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    u_id: {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('browser_visit_items'),
};
