/* eslint-disable import/prefer-default-export */
// CRUD Channels (text/voice/stage) (public, private, role (permissions))
// Add/remove/kick/ban member Channel

// import client from '../client';

// create cohort channels;

/* eslint-disable import/prefer-default-export */
// import Discord, { GuildCreateChannelOptions } from 'discord.js';
import { getGuildClient } from './guild.controller';

// Create a new channel with permission overwrites

export const createChannel = async ({ guild_id, name, options }) => {
  const guild = await getGuildClient(guild_id);
  return guild.channels.create(name, {
    type: options.type,
    permissionOverwrites: [

    ],
  });
};

export const getChannelsByType = async ({ guildID, channelType }) => {
  const guild = getGuildClient(guildID);
  const channels = guild.channels.filter((channel) => channel.type === channelType);
  return { categories: channels.keyArray() };
};
