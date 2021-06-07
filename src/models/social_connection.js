import Sequelize from 'sequelize';
import db from '../database';
import logger from '../util/logger';

export const PROVIDERS = Object.freeze({
  GITHUB: 'github',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
  ZOOM: 'zoom',
  STACKOVERFLOW: 'stackoverflow',
  DISCORD: 'discord',
});

export const SocialConnection = db.define(
  'social_connections',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    provider: Sequelize.STRING,
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    profile: Sequelize.JSON,
    access_token: Sequelize.STRING,
    expiry: Sequelize.DATE,
    created_at: Sequelize.DATE,
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  },
  {},
);

// check if there is a social connection with workspace username
export const authSlack = (username, team) => SocialConnection.findOne({
  where: {
    provider: `slack_${team}`,
    username,
  },
}).then(social_connection => {
  if (social_connection === null) {
    return Promise.reject('User not found!');
  }
  return social_connection;
});

export const getGoogleTokens = (user_id) => SocialConnection.findOne({
  where: {
    user_id,
    provider: PROVIDERS.GOOGLE,
  },
  raw: true,
})
  .then(sc => {
    if (sc) {
      // logger.info(sc);
      return sc.profile.tokens;
    }
    logger.error(`no social connection found for user id: ${user_id}`);
    return null;
  })
  .catch(err => {
    logger.error(err);
    return null;
  });

export const getSocialConnecionByUserId = (user_id, provider) => SocialConnection.findOne({
  where: {
    user_id,
    provider,
  },
});

// zoom <-> user details
export const getSocialConnecionByUsername = (username, provider) => SocialConnection.findOne({
  where: {
    provider,
    username,
  },
});

export const getGithubNameByUserId = (user_id) => SocialConnection.findOne({
  where: {
    user_id,
    provider: PROVIDERS.GITHUB,
  },
  attributes: ['username'],
  raw: true,
});

export const getGithubByUserId = (user_id) => SocialConnection.findOne({
  where: {
    user_id,
    provider: PROVIDERS.GITHUB,
  },
});

export const getGithubConnecionByUserId = user_id => SocialConnection.findOne({
  where: {
    user_id,
    provider: PROVIDERS.GITHUB,
  },
});

// zoom <-> user details
export const getGithubConnecionByGitUsername = (username) => SocialConnection.findOne({
  where: {
    provider: PROVIDERS.GITHUB,
    username,
  },
});

export const getUserIdByEmail = (emails) => SocialConnection.findOne(
  {
    where: {
      email: { [Sequelize.Op.in]: emails },
    },
  },
  { raw: true },
);
