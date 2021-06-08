import axios from 'axios';
import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { SocialConnection, PROVIDERS } from '../../../../models/social_connection';
import { getLimitedDetailsOfUser } from '../../../../models/user';
import client from '../client';

// eslint-disable-next-line import/prefer-default-export
// GET/users/@me
export const getUser = async (access_token) => {
  const response = await axios.get(`${process.env.DISCORD_BASE_API_URL}/users/@me`,
    { headers: { Authorization: `Bearer ${access_token}` } });

  return response.data;
};

export const hasDiscordSocialConnection = async ({ user_id }) => {
  if (user_id) {
    const socialConnection = await SocialConnection.findOne({
      where: {
        user_id,
        provider: PROVIDERS.DISCORD,
      },
    });
    return socialConnection !== null;
  }

  throw new Error('user_id is malformed!');
};

export const addDiscordSocialConnection = (deltaUserId, user, authRes) => SocialConnection.create({
  id: uuid(),
  user_id: deltaUserId,
  provider: PROVIDERS.DISCORD,
  username: `${user.username}#${user.discriminator}`,
  email: user.email,
  profile: user,
  access_token: authRes.refreshToken,
  expiry: authRes.expires,
});

export const getDiscordUserIdsByDeltaUserIds = ({ user_ids }) => SocialConnection.findAll({
  where: {
    user_id: {
      [Sequelize.Op.in]: user_ids,
    },
    provider: 'discord',
  },
}).then(data => data.map(element => element.profile.id));

export const getDiscordUserIdsByDeltaUserIdsOrEmails = ({ user_ids }) => SocialConnection.findAll({
  where: {
    user_id: {
      [Sequelize.Op.in]: user_ids,
    },
    provider: 'discord',
  },
}).then(async data => {
  let notPresent = user_ids;

  let user_discord_ids = data.map(element => {
    let index = notPresent.indexOf(element.user_id);
    if (index > -1) notPresent.splice(index, 1);
    return element.profile.id;
  });

  const userEmails = await Promise.all(notPresent.map(async user_id => {
    let userDetails = await getLimitedDetailsOfUser(user_id);
    return userDetails.email;
  }));

  return _.concat(user_discord_ids, userEmails);
});

export const getBotUserId = () => client.user.id;
