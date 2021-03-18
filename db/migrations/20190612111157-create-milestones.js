const migration = {
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
    // prerequisite_milestones: Sequelize.ARRAY(Sequelize.UUID),
    program: Sequelize.STRING,
    problem_statement: Sequelize.TEXT,
    learning_competencies: Sequelize.ARRAY(Sequelize.STRING),
    guidelines: Sequelize.TEXT,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('milestones'),
};

export default migration;
