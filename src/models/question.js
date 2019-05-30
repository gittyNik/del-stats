const Sequelize = require('sequelize');
import {sequelize} from '../util/dbConnect';


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

Questions.sync({ force: false }).then(function() {
    return true;
});

module.exports = Questions;