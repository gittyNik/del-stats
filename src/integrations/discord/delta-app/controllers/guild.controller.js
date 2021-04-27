import Discord from 'discord.js';
import axios from 'axios';
import client from '../src/client';
import config from '../config';

// https://discord.com/developers/docs/resources/guild

// create server, get Invite
// Add/remove/kick/ban member Server

export const createInvite = async () => {
  const guildClient = new Discord.Guild(client);
  const GuildChannel = guildClient.channels.cache.find(channel => channel.name === 'welcome');
  const inviteUrl = await GuildChannel.createInvite({ maxAge: 0, unique: true, reason: 'Testing.' });

  return inviteUrl;
};

export const addServerMember = async ({ user, options }) => {
  const guildClient = new Discord.Guild(client);
  const response = await guildClient.addMember(user, options);

  return response;
};

export const getGuildClient = async ({ guildID }) => client.guilds.get(guildID);

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
export const addGuildMember = ({ access_token, guild_id, user_id }) => axios.put(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// Remove Guild Member
// DELETE/guilds/{guild.id}/members/{user.id}
export const kickGuildMember = ({ access_token, guild_id, user_id }) => axios.delete(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/members/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });

// Remove Guild Member
// DELETE/guilds/{guild.id}/members/{user.id}
export const banGuildMember = ({ access_token, guild_id, user_id }) => axios.put(`${DISCORD_BASE_API_URL}/guilds/${guild_id}/bans/${user_id}`,
  { headers: { Authorization: `Bearer ${access_token}` } });
