import axios from 'axios';
import { SocialConnection, PROVIDERS } from '../../../../models/social_connection';

// eslint-disable-next-line import/prefer-default-export
// GET/users/@me
export const getUserInfo = (access_token) => axios.get(`${process.env.DISCORD_BASE_API_URL}/users/@me`,
  { headers: { Authorization: `Bearer ${access_token}` } });

export const addDiscordSocialConnection = (deltaUser, user) => SocialConnection.create({
  user_id: deltaUser.id,
  provider: PROVIDERS.DISCORD,
  username: `${user.username}#${user.discriminator}`,
  email: user.email,
  profile: '',
  access_token: user.accessToken,
  expiry: user.expires,
});
