import Sequelize from 'sequelize'
const sequelize = new Sequelize(`postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost/delta_development`,{
    host: 'localhost',
    dialect: 'postgres',
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
module.exports =sequelize