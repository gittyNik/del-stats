import Discord from 'discord.js';
import client from '../client';

// eslint-disable-next-line import/prefer-default-export
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

// export const updateServer = (name, { channels, icon, roles }) =>
