var Sequelize=require('sequelize');


const sequelize = new Sequelize('soal','postgres','tanuj', {
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
//console.log(status);
module.exports={"seq":sequelize};


