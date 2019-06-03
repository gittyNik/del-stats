const db =require('../database');
import Sequelize, { DataTypes } from 'sequelize';

export const links = db.define('Resource', {
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

export const thumbnails = db.define('thumbnails', {
    uid:DataTypes.STRING,
    topic: DataTypes.STRING,
    thumbnail: {
        type: Sequelize.TEXT,
        unique: true
    }
}, {
    freezeTableName: true
});

thumbnails.sync({force:false}).then(function(){
    return true;
});