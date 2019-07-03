module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull:false,
      },
      questions: {
        type: Sequelize.ARRAY(Sequelize.JSON),
        allowNull: false,
      },
      gen_time: Sequelize.DATE,
      sub_time: Sequelize.DATE,
      browser_history: Sequelize.ARRAY(Sequelize.INTEGER),
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tests');
  }
};
