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
  type: {
      type: Sequelize.ENUM('mcq', 'text', 'code'),
      allowNull: false,
    },
  domain: {
      type: Sequelize.ENUM('generic', 'tech', 'mindsets'),
      allowNull: false,
    },
  createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
})

export default TestQuestion;
