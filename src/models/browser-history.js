import  Sequelize from 'sequelize';
const db=require('../src/database');
const browser_history=db.define('browser-history',
{
  
  uid:{
  type:Sequelize.UUIDV4,
  allowNull:false
},
url:{
  type:Sequelize.TEXT,
  allowNull:false
},
ip: {
  type: Sequelize.STRING,
  allowNull:false
},
visited_timestamp: {
  type: Sequelize.DATE,
  allowNull:false

},
visitcount: {
  type: Sequelize.INTEGER,
  allowNull:false
},
title: {
  type: Sequelize.STRING,
  allowNull:false
},
useragent: {
  type: Sequelize.STRING,
  allowNull:false
}

}
);
module.exports={"browser_history":browser_history};