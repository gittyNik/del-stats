import Sequelize from 'sequelize';
import db from '../database';

export const PROVIDERS = Object.freeze({
  GITHUB: 'github',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
});

export const SocialConnection = db.define(
  'social_connections',
  {
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
  },
  {},
);

export const authSlack = (username, team) =>
  // check if there is a social connection with workspace username
  SocialConnection.findOne({
    where: {
      provider: `slack_${team}`,
      username
    }
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
      // console.log(sc);
      return sc.profile.tokens;
    }
    console.log('no social connection found for this user');
    return null;
  })
  .catch(err => {
    console.error(err);
    return null;
  });
