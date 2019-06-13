import Sequelize from 'sequelize'
const sequelize = new Sequelize('postgres','postgres','postgres', {
    host: 'localhost',
    dialect: 'postgres',
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
module.exports =sequelize