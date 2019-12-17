import Sequelize from 'sequelize';
import db from '../database';

export const PingTemplate = db.define('ping_templates', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  text: Sequelize.TEXT,
  details: Sequelize.TEXT,
  author_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  response_format: Sequelize.STRING,
  domain: Sequelize.STRING,
  tags: Sequelize.ARRAY(Sequelize.STRING),
});

export default PingTemplate;