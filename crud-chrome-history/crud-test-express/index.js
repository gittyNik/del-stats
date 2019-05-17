Sequelize=require('sequelize');
var status='no'
const sequelize = new Sequelize('postgres','postgres','tanuj', {
  host:'localhost',
  dialect:'postgres',
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    status='yes'
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });



