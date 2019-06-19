module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('topics', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT,
      },
      program: {
        type: Sequelize.STRING,
        defaultValue:"tep"
      },
      milestone_no : {
        type : Sequelize.UUID,
        references:{ model: 'milestones', key: 'id' }
      },
      createdAt:
      {
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
    return queryInterface.dropTable('topics');
  }
};
