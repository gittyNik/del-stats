module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('test_questions', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    question: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    answer: Sequelize.JSON,
    type: {
      type: Sequelize.ENUM('mcq', 'text', 'code', 'rate', 'logo'),
      allowNull: false,
    },
    domain: {
      type: Sequelize.ENUM('generic', 'tech', 'mindsets'),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('test_questions', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_questions_type";', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_questions_domain";', { transaction }),
  ])),
};
