import Sequelize from 'sequelize';
import db from '../database';

const TestQuestion = db.define('test_question', {
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
});

export default TestQuestion;
