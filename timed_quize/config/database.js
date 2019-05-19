const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'soal', {
    host: 'localhost',
    dialect:'postgres',
    operatorsAliases:'false',
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:1000
    }
});

module.exports = sequelize;