import { TEST_QUESTION_TYPE, TEST_QUESTION_DOMAIN } from '../common/enums';

const migration = {
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
      type: Sequelize.ENUM(...TEST_QUESTION_TYPE),
      allowNull: false,
    },
    domain: {
      type: Sequelize.ENUM(...TEST_QUESTION_DOMAIN),
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
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

export default migration;
