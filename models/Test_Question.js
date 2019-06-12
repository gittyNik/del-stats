import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

const TestQuestions = sequelize.define('test_question', {
    question: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
  })

module.exports = TestQuestions;