/* eslint-disable import/prefer-default-export */
// CRUD Channels (text/voice/stage) (public, private, role (permissions))
// Add/remove/kick/ban member Channel
// import client from '../client';

// create cohort channels;

/* eslint-disable import/prefer-default-export */
// import Discord, { GuildCreateChannelOptions } from 'discord.js';
import { Cohort } from '../../../../models/cohort';
import { GUILD_IDS_BY_PROGRAM } from '../config';
import { getGuild, getGuildIdFromProgram } from './guild.controller';
import { getDiscordUserIdsByDeltaUserIds } from './user.controller';
import { getCohortFormattedId } from '../utils';
import { findRole } from './role.controller';

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
  const guild = await getGuild({ guild_id });
  return guild.channels.cache.find(ch => ch.name === channel_name);
};

export const getChannelForCohort = async ({ cohort_id }) => {
  const cohort = await Cohort.findOne({
    where: {
      id: cohort_id,
    },
  },
  { raw: true });

  const cohortChannelName = getCohortFormattedId({ data: [cohort], program_type: cohort.program_id });
  const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });
  const cohortChannel = await findChannelByName({ guild_id, channel_name: cohortChannelName[0] });

  return cohortChannel;
};

export const moveLearnerToNewDiscordChannel = async ({ learner_id, current_cohort_id, future_cohort_id }) => {
  try {
    const currentCohort = Cohort.findOne({
      where: {
        id: current_cohort_id,
      },
    },
    { raw: true });
    const futureCohort = Cohort.findOne({
      where: {
        id: future_cohort_id,
      },
    },
    { raw: true });

    let discordUserIds = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner_id] });

    const guild_id = GUILD_IDS_BY_PROGRAM.find(i => current_cohort_id.program_id === i.PROGRAM_ID).GUILD_ID;
    const guild = getGuild({ guild_id });

    const currentCohortChannelName = getCohortFormattedId([{ data: [currentCohort], program_type: currentCohort.program_id }]);
    const futureCohortChannelName = getCohortFormattedId([{ data: [futureCohort], program_type: futureCohort.program_id }]);

    const currentCohortRole = await findRole({ guild_id, name: currentCohortChannelName });
    const futureCohortRole = await findRole({ guild_id, name: futureCohortChannelName });

    const discordUser = await (await guild).members.fetch(discordUserIds[0]);

    await discordUser.roles.remove(currentCohortRole);
    await discordUser.roles.add(futureCohortRole);
  } catch (err) {
    throw new Error(err);
  }
};

export const removeLearnerFromDiscordChannel = async ({ learner_id, current_cohort_id }) => {
// @TO-DO Remove learner from server or channel
// removeLearner in cohort.js
};
