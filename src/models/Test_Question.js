import Sequelize from 'sequelize';
import db from '../database';

const TestQuestions = db.define('test_question', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDv4,
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
      defaultValue: Sequelize.NOW,
    },
  updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  })

  export default TestQuestions;