import Sequelize from 'sequelize';
import db from '../database';

export const PROVIDERS = Object.freeze({
  GITHUB: 'github',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
});

export const SocialConnection = db.define('social_connections', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  user_id: Sequelize.UUID,
  provider: Sequelize.STRING,
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  profile: Sequelize.JSON,
  access_token: Sequelize.STRING,
  expiry: Sequelize.DATE,
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,
},{});

export default SocialConnection;
