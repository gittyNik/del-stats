import Sequelize from 'sequelize';
import db from '../database';

export const ResourceVisit = db.define('resource_comments', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  resource_id: {
    type: Sequelize.UUID,
    references: { model: 'resources', key: 'id' },
  },
  user_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  source: Sequelize.STRING,
  details: Sequelize.JSON, // keywords, tags, prev_link etc
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,
});

export default ResourceVisit;
