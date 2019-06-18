import Sequelize from 'sequelize';
import db from '../database';

export const Resource_Comments = db.define('resource_comments', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  resource_id: {
    type: Sequelize.UUID,
    references: { model: 'resources', key: 'id' }
  },
  comments: {
    type: Sequelize.TEXT,
      allowNull: false,
    },
  })
