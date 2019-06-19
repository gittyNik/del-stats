import Sequelize from 'sequelize';
import db from '../database';

const ResourceComment = db.define('resource_comments', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  resource_id: {
    type: Sequelize.UUID,
    references: { model: 'resources', key: 'id' }
  },
  comment: {
    type: Sequelize.TEXT,
      allowNull: false,
    },
  })

export default ResourceComment;
