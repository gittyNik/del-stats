// 'use strict';
// module.exports = (sequelize, DataTypes) => {
//   const question = sequelize.define('question', {
//     question: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     options: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false
//     },
//     answer: {
//       type: DataTypes.ARRAY(DataTypes.INTEGER),
//       allowNull: false
//     }
//   }, {});
//   question.associate = function(models) {
//     // associations can be defined here
//   };
//   return question;
// };

const Sequelize = require('sequelize');
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