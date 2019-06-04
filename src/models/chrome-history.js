const index=require('../database')
import Sequelize from 'sequelize'; 
export const links = index.define('history', {
    user_id: {
      type: Sequelize.STRING
    },
    url: {
      type: Sequelize.STRING(2000)
    },
    ip:{
      type:Sequelize.STRING
    },
    visited_timestamp:{
      type: Sequelize.STRING
    },
    title:
    {
      type:Sequelize.STRING
    },
    visitcount:
    {
      type:Sequelize.INTEGER
    },
    useragent:
    {
      type: Sequelize.STRING
    }


  }, {
    freezeTableName: true
  });
  links.sync({force: false}).then(function () {
    return true;
  });
