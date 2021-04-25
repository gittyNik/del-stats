import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { SocialConnection, PROVIDERS } from '../../../../models/social_connection';

// eslint-disable-next-line import/prefer-default-export
// GET/users/@me
export const getUser = (access_token) => axios.get(`${process.env.DISCORD_BASE_API_URL}/users/@me`,
  { headers: { Authorization: `Bearer ${access_token}` } });

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

  throw Error('user_id is malformed!');
};

export const addDiscordSocialConnection = (deltaUser, user) => SocialConnection.create({
  id: uuid(),
  user_id: deltaUser.id,
  provider: PROVIDERS.DISCORD,
  username: `${user.username}#${user.discriminator}`,
  email: user.email,
  profile: user.data,
  access_token: user.accessToken,
  expiry: user.expires,
});
