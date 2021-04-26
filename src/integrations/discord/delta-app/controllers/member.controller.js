/* eslint-disable import/prefer-default-export */
/// guilds/{guild.id}

import axios from 'axios';

export const getGuild = ({ access_token, guild_id, user_id }) => axios.get(`${process.env.DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });
