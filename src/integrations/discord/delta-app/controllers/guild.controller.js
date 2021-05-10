/* eslint-disable no-restricted-syntax */
/* linter complains:
 * iterators/generators require regenerator-runtime, which is too
 * heavyweight for this guide to allow them. Separately, loops should be
 * avoided in favor of array iterations
 */

import axios from 'axios';
import config, {
  SETUP_CHANNELS,
  GUILD_IDS_BY_PROGRAM,
} from '../config';
// import { ROLE_PERMISSIONS } from '../config/constants';
import client from '../client';
import {
  Cohort,
} from '../../../../models/cohort';
import { createSetupRolesAndChannels, createProgramRoles, createCohortRolesAndChannels } from './setup.controller';

export const getGuild = async ({ guild_id }) => client.guilds.fetch(guild_id);

export const getGuildIdsFromProgramIds = ({ program_ids }) => {
  if (program_ids.length === 1) {
    // single program id, single guild id
    return [GUILD_IDS_BY_PROGRAM.find(element => element.PROGRAM_ID === program_ids).GUILD_ID];
  }
  if (program_ids.length > 1) {
    // multiple program id
    const guild_ids = [...(new Set(GUILD_IDS_BY_PROGRAM.filter(element => program_ids.includes(element.PROGRAM_ID)).map(element => element.GUILD_ID)))];

    // single guild id
    if (guild_ids.length === 1) {
      return guild_ids[0];
    }

    // multiple guild ids
    if (guild_ids.length === program_ids.length) {
      return guild_ids;
    }

    throw new Error('multiple program id with multiple guild ids with mismatched length isn\'t supported for  GUILD_IDS_BY_PROGRAM in config!');
  }

  throw new Error('Check GUILD_IDS_BY_PROGRAM in config! or program_ids is empty');
};

export const getGuildIdFromProgram = ({ program_id }) => GUILD_IDS_BY_PROGRAM.find(element => element.PROGRAM_ID === program_id).GUILD_ID;

export const getGuildIdFromCohort = async ({ cohort_id }) => {
  const cohort = await Cohort.findOne({
    where: {
      id: cohort_id,
    },
  },
  { raw: true });
  const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });

  return guild_id;
};

// https://discord.com/developers/docs/resources/guild

// create server, get Invite
// Add/remove/kick/ban member Server

export const serverSetup = async ({ program_ids }) => {
  const guild_ids = getGuildIdsFromProgramIds({ program_ids });

  // uncomment to delete all channels and roles first
  // await guild.channels.cache.forEach(channel => channel.delete());
  // await guild.roles.cache.forEach(role => role.delete());

  if ((typeof guild_ids === 'string' || guild_ids instanceof String) && Array.isArray(program_ids)) {
    // single discord server for multiple Programs

    await createSetupRolesAndChannels(guild_ids);
    createProgramRoles(guild_ids, program_ids);
    for (const program_id of program_ids) createCohortRolesAndChannels(guild_ids, program_id);

    //
  } else if (
    ((Array.isArray(guild_ids) && Array.isArray(program_ids)) && guild_ids.length === program_ids.length)) {
    // Multiple discord Servers for multiple Programs

    for (const [index, guild_id] of guild_ids.entries()) {
      createSetupRolesAndChannels(guild_id);
      createProgramRoles(guild_id, [program_ids[index]]);
      createCohortRolesAndChannels(guild_id, program_ids[index]);
    }

    //
  } else {
    throw new Error('Multiple Servers for Single Program or Guild_IDs for ProgramIDs Mismatch in length!');
  }

  return 'Setup Server Successful!';
};

export const createInvite = async ({ guild_id }) => {
  const guild = await getGuild({ guild_id });
  const welcome_channel = await guild.channels.cache.find(ch => ch.name === SETUP_CHANNELS[0].data.public[1].channels[0]);
  const inviteUrl = await welcome_channel.createInvite({ maxAge: 0, unique: true, reason: 'create Invite controller called!' });

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
