import Sequelize from 'sequelize';
import db from '../database';

export const BrowserVisitItem = db.define('browser_visit_items', {
  user_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  browser_url_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'browser_history_items', key: 'browser_url_id' },
  },
  visited_timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  visit_id: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  transition: {
    type: Sequelize.STRING,
  },
});

export default BrowserVisitItem;
