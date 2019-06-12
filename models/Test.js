import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

const Tests = sequelize.define('tests', {
    questions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      generateTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      submitTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('coding', 'logical', 'mindset'),
        allowNull: false,
      },
      browserSession: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
  })

module.exports = Tests;