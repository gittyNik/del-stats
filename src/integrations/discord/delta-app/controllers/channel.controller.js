/* eslint-disable import/prefer-default-export */
// CRUD Channels (text/voice/stage) (public, private, role (permissions))
// Add/remove/kick/ban member Channel
// import client from '../client';

// create cohort channels;

/* eslint-disable import/prefer-default-export */
// import Discord, { GuildCreateChannelOptions } from 'discord.js';
import { Cohort } from '../../../../models/cohort';
import { getGuild, getGuildIdFromProgram } from './guild.controller';
import { getCohortFormattedId } from '../utils';

// Create a new channel with permission overwrites

export const createChannel = async ({ guild_id, name, options }) => {
  const { type, permissionOverwrites, parent } = options;
  if (type && guild_id && name) {
    const guild = await getGuild({ guild_id });
    return guild.channels.create(name, {
      type,
      parent,
      permissionOverwrites,
    });
  }

  throw new Error('Parameters invalid');
};

export const getChannelsByType = async ({ guildID, channelType }) => {
  const guild = getGuild(guildID);
  const channels = guild.channels.filter((channel) => channel.type === channelType);
  return { categories: channels.keyArray() };
};

export const findChannelByName = async ({ guild_id, channel_name }) => {
  const guild = await getGuild(guild_id);
  return guild.channels.cache.find(ch => ch.name === channel_name);
};

export const getChannelForCohort = async ({ cohort_id }) => {
  const cohort = Cohort.findOne({
    where: {
      id: cohort_id,
    },
  },
  { raw: true });
  const cohortChannelName = getCohortFormattedId([{ cohort, program_type: cohort.program_id }]);
  const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });
  const cohortChannel = await findChannelByName({ guild_id, name: cohortChannelName });

  return cohortChannel;
};
