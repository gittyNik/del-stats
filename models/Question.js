import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

var Questions = sequelize.define('question', {
    question: {
      type: Sequelize.STRING,
      allowNull: false
    },
    options: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false
    }, 
    answer: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: false
    }
  });

module.exports = Questions;