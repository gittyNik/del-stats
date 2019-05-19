const Sequelize = require('sequelize');
const db = require('../config/database');

var Questions = db.define('questions', {
    question: {
      type: Sequelize.STRING,
      allowNull: false
    },
    options: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false
    },
    answer: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

Questions.sync({ force: false }).then(function() {
    return true;
});

  module.exports = Questions;