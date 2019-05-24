import Sequelize from 'sequelize'
const sequelize = new Sequelize('postgres://postgres:1998@localhost/delta_development', {
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
module.exports =sequelize