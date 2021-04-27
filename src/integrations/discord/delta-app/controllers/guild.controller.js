import Discord from 'discord.js';
import axios from 'axios';
import config from '../config';

/* eslint-disable import/prefer-default-export */
import client from '../client';

export const getGuildClient = async ({ guildID }) => client.guilds.get(guildID);

// https://discord.com/developers/docs/resources/guild

// create server, get Invite
// Add/remove/kick/ban member Server

export const createInvite = async () => {
  const guildClient = new Discord.Guild(client);
  const GuildChannel = guildClient.channels.cache.find(channel => channel.name === 'welcome');
  const inviteUrl = await GuildChannel.createInvite({ maxAge: 0, unique: true, reason: 'Testing.' });

  return inviteUrl;
};

const { DISCORD_BASE_API_URL } = config;
// Get Guild Member

export const getGuildMemberById = ({ access_token, guild_id, user_id }) => axios.get(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// List Guild Members
// GET /guilds/{guild.id}/members

export const getGuildMembers = ({ access_token, guild_id }) => axios.get(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// Get Current User Guilds
// GET/users/@me/guilds
export const getGuildsofUser = (access_token) => axios.get(`${process.env.DISCORD_BASE_API_URL}/users/@me`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// Add Guild Member
// PUT/guilds/{guild.id}/members/{user.id}
export const addGuildMember = ({
  discord_user_access_token,
  discord_bot_access_token,
  guild_id,
  user_id,
}) => axios.put(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`, {
  access_token: discord_user_access_token,
}, {
  headers: {
    Authorization: `Bot ${discord_bot_access_token}`,
    'Content-Type': 'application/json',
  },
});

// Remove Guild Member
// DELETE/guilds/{guild.id}/members/{user.id}
export const kickGuildMember = ({ access_token, guild_id, user_id }) => axios.delete(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// Remove Guild Member
// DELETE/guilds/{guild.id}/members/{user.id}
export const banGuildMember = ({ access_token, guild_id, user_id }) => axios.put(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/bans/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });
