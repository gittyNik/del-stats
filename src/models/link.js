const db =require('../database');
import Sequelize, { DataTypes } from 'sequelize';

const links = db.define('Resources', {
    uid:DataTypes.STRING,
    topic: DataTypes.STRING,
    url: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    freezeTableName: true
});

links.sync({force:false}).then(function(){
    return true;
});
module.exports= links;