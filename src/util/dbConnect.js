import dotenv from 'dotenv/config';
import mongoose from 'mongoose';
import Sequelize from 'sequelize';
import config from '../../config/config.json'
const {NODE_ENV, MONGO_HOST, MONGO_DB: dbName, MONGO_USER: user, MONGO_PWD: pass} = process.env;

mongoose.set('debug', NODE_ENV === 'development');
mongoose.Promise = Promise;
console.log(MONGO_HOST);
export default () => mongoose.connect(MONGO_HOST, {user, pass});

export const sequelize = new Sequelize(`postgres://${config.development.username}:${config.development.password}@localhost/${config.development.database}`, {
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});