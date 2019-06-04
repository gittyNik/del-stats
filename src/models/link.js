const db =require('../database');
import { DataTypes } from 'sequelize';

export const links = db.define('Resource', {
    uid:DataTypes.STRING,
    topic: DataTypes.STRING,
    url: {
        type: DataTypes.STRING,
        unique: true
    },
    status:{
        type: DataTypes.STRING,
        defaultValue: 'pending'
    }
});

links.sync({force:false}).then(function(){
    return true;
});

export const resource_reports = db.define('resource_reports', {
    resource_id:DataTypes.INTEGER,
    report: DataTypes.STRING,
    status:{
        type: DataTypes.STRING,
        defaultValue: 'pending'
    }
});

resource_reports.sync({force:false}).then(function(){
    return true;
});