import Sequelize from 'sequelize';
import db from '../database';

export const Resource_Vote = db.define('resource_votes', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull:false
  },
  resource_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'resources', key: 'id' }
  },
  vote: {
    type: Sequelize.STRING,
    allowNull:false
  }
});

