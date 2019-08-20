module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('milestones', {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.UUID,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    prerequisite_milestones: Sequelize.ARRAY(Sequelize.UUID),
    program: Sequelize.STRING,
    problem_statement: Sequelize.TEXT,
    learning_competencies: Sequelize.ARRAY(Sequelize.STRING),
    guidelines: Sequelize.TEXT,
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('milestones'),
};
