'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tests', {
      // id: {
      //   type: Sequelize.UUID,
      //   primaryKey: true,
      //   defaultValue: Sequelize.UUIDv4,
      // },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      questions: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      generateTime: {
        type: Sequelize.DATE,
        allowNull: Sequelize.NOW,
      },
      submitTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('coding', 'logical', 'mindset'),
        allowNull: false,
      },
      browserSession: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tests');
  }
};