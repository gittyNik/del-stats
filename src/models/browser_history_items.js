import Sequelize from 'sequelize';
import db from '../src/database';

const browser_history_items = db.define('browser_history_items', {
  browser_url_id:{
    type:Sequelize.INTEGER,
    allowNull:false,
    unique:true
  },
  url:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  title:{
    type:Sequelize.STRING,
    allowNull:false
  },
  useragent:{
    type:Sequelize.STRING,
    allowNull:false
  }
});

export default browser_history_items;
