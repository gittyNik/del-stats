module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('milestones', {
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
      },
      name : {
        allowNull : false,
        type : Sequelize.STRING
      },
      prerequisite_milestones: Sequelize.ARRAY(Sequelize.UUID),
      program: Sequelize.STRING,
      problem_statement: Sequelize.TEXT,
      learning_competencies: Sequelize.ARRAY(Sequelize.STRING),
      guidelines: Sequelize.TEXT,
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
    return queryInterface.dropTable('milestones');
  }
};
