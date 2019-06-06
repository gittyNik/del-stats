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

export const resource_comments = db.define('resource_comments', {
    resource_id:DataTypes.INTEGER,
    comments: DataTypes.STRING,
});

resource_comments.sync({force:false}).then(function(){
    return true;
});

export const resource_topics = db.define('resource_topics', {
    topic_name: {
        type: DataTypes.STRING,
        unique : true
    }
},{
    createdAt : false,
    updatedAt : false,
    deletedAt : false

});

resource_topics.sync({force:false}).then(function(){
    return true;
});

export const milestones = db.define('milestones', {
    topics : DataTypes.ARRAY(DataTypes.INTEGER),
    milestone_name : DataTypes.STRING,
},{
    createdAt : false,
    updatedAt : false,
    deletedAt : false

});

milestones.sync({force:false}).then(function(){
    return true;
});