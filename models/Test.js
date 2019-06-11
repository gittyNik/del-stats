import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

var Tests = sequelize.define('test', {
    questions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gen_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      sub_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('coding', 'logical', 'mindset'),
        allowNull: false,
      },
      browser_session: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
  })

module.exports = Tests;