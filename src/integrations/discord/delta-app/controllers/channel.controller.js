/* eslint-disable import/prefer-default-export */
// CRUD Channels (text/voice/stage) (public, private, role (permissions))
// Add/remove/kick/ban member Channel

// import client from '../client';
import { getGuildClient } from './guild.controller';

// @TO-DO create const of all channel types = 'catagories'
export const getAllChannelTypes = async ({ guildID }) => {
  const guild = getGuildClient(guildID);
  const channelTypes = guild.channels.map((channel) => channel.type);
  // res.send();
  return { channelTypes };
};

export const getChannelsByType = async ({ guildID, channelType }) => {
  const guild = getGuildClient(guildID);
  const channels = guild.channels.filter((channel) => channel.type === channelType);
  // res.send();
  return { categories: channels.keyArray() };
};
