var Sequelize = require('sequelize');
var status = 'N';
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
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
        //status = 'S';
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
//console.log(sequelize);
module.exports = { "seq": sequelize };