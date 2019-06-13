import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

const TestQuestions = sequelize.define('test_question', {
    // id: {
    // type: Sequelize.UUID,
    // primaryKey: true,
    // defaultValue: Sequelize.UUIDV4,
    // },
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    question: {
        type: Sequelize.JSON,
        allowNull: false,
      },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
  })

module.exports = TestQuestions;