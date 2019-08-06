import Sequelize from 'sequelize';
import db from '../database';

export const PROVIDERS = Object.freeze({
  GITHUB: 'github',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
});

export const User = db.define('social_connections', {
  id: Sequelize.UUID,
  user_id: Sequelize.UUID,
  provider: Sequelize.STRING,
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  profile: Sequelize.JSON,
  access_token: Sequelize.STRING,
  expiry: Sequelize.DATE,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
},{});

export default SocialConnection;
