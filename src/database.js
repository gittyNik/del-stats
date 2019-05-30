import Sequelize from 'sequelize'
import dotenv from 'dotenv/config'
const sequelize = new Sequelize(`postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@localhost/delta_development`, {
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
module.exports =sequelize