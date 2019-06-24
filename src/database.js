import Sequelize from 'sequelize';
import dotenv from 'dotenv/config';

const {DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD} = process.env;
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME,
  DATABASE_PASSWORD, {
    dialect:'postgres',
    pool: {
      max: 5,
      acquire: 30000,
      idle: 10000,
    }
  });

export default sequelize;
