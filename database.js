import Sequelize from 'sequelize';
import dotenv from 'dotenv/config';

const {DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD} = process.env;
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME,
  DATABASE_PASSWORD, { dialect:'postgres'});
module.exports = sequelize;
