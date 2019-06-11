'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tests', {
      questions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gen_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      sub_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('coding', 'logical', 'mindset'),
        allowNull: false,
      },
      browser_session: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tests');
  }
};