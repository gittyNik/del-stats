import axios from 'axios';
import { SocialConnection, PROVIDERS } from '../../../../models/social_connection';

// eslint-disable-next-line import/prefer-default-export
// GET/users/@me
export const getUserInfo = (access_token) => axios.get(`${process.env.DISCORD_BASE_API_URL}/users/@me`,
  { headers: { Authorization: `Bearer ${access_token}` } });

export const hasDiscordSocialConnection = async ({ email, user_id }) => {
  if (email && user_id) {
    const socialConnection = await SocialConnection.findOne({
      where: {
        user_id,
        provider: PROVIDERS.DISCORD,
        email,
      },
    });
    return socialConnection !== null;
  }
  if (user_id && !email) {
    const socialConnection = await SocialConnection.findOne({
      where: {
        user_id,
        provider: PROVIDERS.DISCORD,
      },
    });
    return socialConnection !== null;
  }
  if (email && !user_id) {
    const socialConnection = await SocialConnection.findOne({
      where: {
        email,
        provider: PROVIDERS.DISCORD,
      },
    });
    return socialConnection !== null;
  }
  throw Error('email or user_id is malformed!');
};

export const addDiscordSocialConnection = (deltaUser, user) => SocialConnection.create({
  user_id: deltaUser.id,
  provider: PROVIDERS.DISCORD,
  username: `${user.username}#${user.discriminator}`,
  email: user.email,
  profile: '',
  access_token: user.accessToken,
  expiry: user.expires,
});
