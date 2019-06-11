import Sequelize from 'sequelize';
import {sequelize} from '../src/util/dbConnect';

var user = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING
})

module.exports = user;