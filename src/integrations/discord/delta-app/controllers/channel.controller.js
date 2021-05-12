/* eslint-disable import/prefer-default-export */
// CRUD Channels (text/voice/stage) (public, private, role (permissions))
// Add/remove/kick/ban member Channel
// import client from '../client';

// create cohort channels;

/* eslint-disable import/prefer-default-export */
// import Discord, { GuildCreateChannelOptions } from 'discord.js';
import { Cohort, getCohortFromId } from '../../../../models/cohort';
import { getGuild, getGuildIdFromProgram } from './guild.controller';
import { getDiscordUserIdsByDeltaUserIds } from './user.controller';
import { getCohortFormattedId } from '../utils';
import { findRole, createRole, addRoleToUser } from './role.controller';
import {
  SAILOR_PERMISSIONS, SETUP_ROLES, PIRATE_PERMISSIONS, CAPTAIN_PERMISSIONS,
  GUILD_IDS_BY_PROGRAM, PROGRAM_NAMES,
} from '../config';

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
  const guild = await getGuild(guildID);
  const channels = guild.channels.filter((channel) => channel.type === channelType);
  return { categories: channels.keyArray() };
};

export const findChannelByName = async ({ guild_id, channel_name }) => {
  const guild = await getGuild({ guild_id });
  return guild.channels.cache.find(ch => ch.name === channel_name);
};

export const getChannelForCohort = async ({ cohort_id }) => {
  const cohort = await getCohortFromId(cohort_id);

  const cohortChannelName = getCohortFormattedId({ data: [cohort], program_type: cohort.program_id });
  const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });
  const cohortChannel = await findChannelByName({ guild_id, channel_name: cohortChannelName[0] });

  return cohortChannel;
};

export const moveLearnerToNewDiscordChannel = async ({ learner_id, current_cohort_id, future_cohort_id }) => {
  try {
    const currentCohort = await getCohortFromId(current_cohort_id);
    const futureCohort = await getCohortFromId(future_cohort_id);

    let discordUserIds = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner_id] });

    const guild_id = GUILD_IDS_BY_PROGRAM.find(index => current_cohort_id.program_id === index.PROGRAM_ID).GUILD_ID;
    const guild = await getGuild({ guild_id });

    const currentCohortChannelName = getCohortFormattedId([{ data: [currentCohort], program_type: currentCohort.program_id }]);
    const futureCohortChannelName = getCohortFormattedId([{ data: [futureCohort], program_type: futureCohort.program_id }]);

    const currentCohortRole = await findRole({ guild_id, name: currentCohortChannelName });
    const futureCohortRole = await findRole({ guild_id, name: futureCohortChannelName });

    const discordUser = await guild.members.fetch(discordUserIds[0]);

    await discordUser.roles.remove(currentCohortRole);
    await discordUser.roles.add(futureCohortRole);
  } catch (error) {
    throw new Error(error);
  }
};

export const removeLearnerFromDiscordServer = async ({ learner_id, current_cohort_id }) => {
// Remove learner from server or channel, KICK dropout learner
// removeLearner in cohort.js

  try {
    let discordUserIds = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner_id] });

    const guild_id = GUILD_IDS_BY_PROGRAM.find(index => current_cohort_id.program_id === index.PROGRAM_ID).GUILD_ID;
    const guild = await getGuild({ guild_id });

    const discordUser = await guild.members.fetch(discordUserIds[0]);

    const response = await discordUser.kick('removeLearnerFromDiscordChannel Delta_API');

    return response;
  } catch (error) {
    console.log('Bot unable to kick the member');
    throw new Error(error);
  }
};

export const stageLearnerFromDiscordChannel = async ({ learner_id, cohort_id }) => {
// for marking on leave, remove cohort & program roles, keep in server
// /learner/onleave

  try {
    const cohort = await getCohortFromId(cohort_id);
    let discordUserIds = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner_id] });

    const guild_id = GUILD_IDS_BY_PROGRAM.find(index => cohort.program_id === index.PROGRAM_ID).GUILD_ID;
    const guild = await getGuild({ guild_id });

    const discordUser = await guild.members.fetch(discordUserIds[0]);

    const currentCohortChannelName = getCohortFormattedId([{ data: [cohort], program_type: cohort.program_id }]);

    const currentCohortRole = await findRole({ guild_id, name: currentCohortChannelName });
    const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === cohort.program_id).name });

    await discordUser.roles.remove(currentCohortRole);
    await discordUser.roles.remove(programRole);
  } catch (error) {
    throw new Error('stageLearnerFromDiscordChannel failed!');
  }
};

// add single learner to cohort
export const addLearnerToCohortDiscordChannel = async ({ cohort_id, learner }) => {
  try {
    let discordUserIds = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner] });

    const guild_id = GUILD_IDS_BY_PROGRAM.find(index => cohort_id.program_id === index.PROGRAM_ID).GUILD_ID;
    const guild = await getGuild({ guild_id });

    const user = await guild.members.fetch(discordUserIds[0]);

    const cohort = await Cohort.findOne({
      where: {
        id: cohort_id,
      },
    },
    { raw: true });
    const cohortChannelName = getCohortFormattedId([{ cohort, program_type: cohort.program_id }]);

    const cohortRole = await findRole({ guild_id, name: cohortChannelName });
    const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === cohort.program_id).name });

    return Promise.all([
      addRoleToUser({ guild_id, role_name: cohortRole.name, user_id: user.id }),
      addRoleToUser({ guild_id, role_name: programRole.name, user_id: user.id }),
    ]);
  } catch (error) {
    throw new Error(error);
  }
};

export const addLearnersToCohortDiscordChannel = async ({ cohort_id, learners }) => {
  try {
    await learners.forEach(async learner => {
      await addLearnerToCohortDiscordChannel(cohort_id, learner);

      return 'Added learner to discord channel! addLearnersToCohortDiscordChannel';
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const createChannelForCohort = async ({ cohort_id }) => {
  try {
    const cohort = await getCohortFromId(cohort_id);

    const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });
    const guild = await getGuild({ guild_id });

    const cohortNameIds = getCohortFormattedId({ data: [cohort], program_id: cohort.program_id });

    // create cohort roles
    await Promise.all(
      cohortNameIds.map(element => createRole({
        data: {
          name: element,
          color: 'BLURPLE',
          permissions: SAILOR_PERMISSIONS,
        },
        reason: 'cohort role for create channel cohort API',
        guild_id,
      })),
    );

    // find category and add create new channel with role permissions
    const categoryChannel = await findChannelByName({ guild_id, channel_name: `${PROGRAM_NAMES.find(name => cohort.program_id === name.id).sf} cohorts 🏡` });

    const captain = await findRole({ guild_id, name: SETUP_ROLES[0].name });
    const pirate = await findRole({ guild_id, name: SETUP_ROLES[1].name });
    const everyoneRole = await findRole({ guild_id, name: '@everyone' });

    const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === cohort.program_id).name });

    await Promise.all(
      cohortNameIds.map(async element => {
        const allRolesExceptCurrentCohort = await guild.roles.cache.filter(role => (role.name !== element && cohortNameIds.includes(role.name))
               || role.name === '@everyone' || role.id !== programRole.id);

        const cohortRole = await findRole({ guild_id, name: element });

        const denyPermissionOverwrites = allRolesExceptCurrentCohort.map(role => ({ id: role.id, deny: ['VIEW_CHANNEL'] }));

        const allowPermissionOverwrites = [
          { id: captain.id, allow: CAPTAIN_PERMISSIONS },
          { id: pirate.id, allow: PIRATE_PERMISSIONS },
          { id: cohortRole.id, allow: SAILOR_PERMISSIONS },
          { id: programRole.id, allow: SAILOR_PERMISSIONS },
          { id: everyoneRole.id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
        ];

        const permissionOverwrites = [...denyPermissionOverwrites, ...allowPermissionOverwrites];

        return guild.channels.create(element, {
          type: 'text',
          parent: categoryChannel,
          permissionOverwrites,
        });
      }),
    );
  } catch (error) {
    throw new Error('Error in createChannelForCohort in Discord');
  }

  return 'createChannelForCohort successful!';
};
