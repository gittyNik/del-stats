'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('browser-histories', {
      id:
      {
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
        type:Sequelize.INTEGER
      },
    uid:{
        type:Sequelize.UUID,
        allowNull:false

      },
      url:{
        type:Sequelize.TEXT,
        allowNull:false
      },
      ip: {
        type: Sequelize.STRING,
        allowNull:false
      },
      visited_timestamp: {
        type: Sequelize.DATE,
        allowNull:false
      
      },
      visitcount: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      title: {
        type: Sequelize.STRING,
        allowNull:false
      },
      useragent: {
        type: Sequelize.STRING,
        allowNull:false
      },

      createdAt: {
        allowNull:false,
        type:Sequelize.DATE
      },
      updatedAt:{
        allowNull:false,
        type:Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('browser-histories');
  }
};