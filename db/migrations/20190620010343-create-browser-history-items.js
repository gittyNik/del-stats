'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('browser_history_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
    browser_url_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        unique:true
      },
      url:{
        type:Sequelize.TEXT,
        allowNull:false
      },
      title:{
        type:Sequelize.STRING,
        allowNull:false
      },
      useragent:{
        type:Sequelize.STRING,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('browser_history_items');
  }
};