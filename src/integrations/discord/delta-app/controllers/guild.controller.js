import axios from 'axios';
import _ from 'lodash';
import { Promise } from 'core-js';
import config, {
  SAILOR_PERMISSIONS, SETUP_ROLES, SETUP_CHANNELS, PIRATE_PERMISSIONS, CAPTAIN_PERMISSIONS,
  GUILD_IDS_BY_PROGRAM,
} from '../config';
// import { ROLE_PERMISSIONS } from '../config/constants';
import client from '../client';
import { getCohortFormattedId } from '../utils';
import { getLiveCohorts } from '../../../../models/cohort';
import { createRole, findRole } from './role.controller';

export const getGuild = async ({ guild_id }) => client.guilds.fetch(guild_id);

export const getGuildIdFromProgram = async ({ program_id }) => GUILD_IDS_BY_PROGRAM.find(el => el.PROGRAM_ID === program_id);

// https://discord.com/developers/docs/resources/guild

// create server, get Invite
// Add/remove/kick/ban member Server

export const serverSetup = async ({ program_id }) => {
  const data = await getLiveCohorts();
  const cohortNameIds = getCohortFormattedId({ data, program_id });

  const guild_id = getGuildIdFromProgram({ program_id });
  const guild = await getGuild({ guild_id });

  // uncomment to delete all channels and roles first
  // await guild.channels.cache.forEach(channel => channel.delete());
  // await guild.roles.cache.forEach(role => role.delete());

  // create setup roles
  await Promise.all(
    SETUP_ROLES.map(e => createRole({
      data: {
        name: e.name,
        color: e.color,
        permissions: e.role,
      },
      reason: 'General Setup Role',
      guild_id,
    })),
  );

  // create cohort roles
  await Promise.all(
    cohortNameIds.map(e => createRole({
      data: {
        name: e,
        color: 'BLURPLE',
        permissions: SAILOR_PERMISSIONS,
      },
      reason: 'cohort role for server setup',
      guild_id,
    })),
  );

  const everyoneRole = await findRole({ guild_id, name: '@everyone' });
  const captain = await findRole({ guild_id, name: SETUP_ROLES[0].name });
  const pirate = await findRole({ guild_id, name: SETUP_ROLES[1].name });
  // const sailor = await findRole({ guild_id, name: SETUP_ROLES[2].name });

  // create setup channels
  SETUP_CHANNELS.map(ch => {
    ch.data.public.map(c => guild.channels.create(c.category, { type: 'category' }).then(
      async cat => {
        await Promise.all(
          c.channels.map(e => guild.channels.create(e, {
            type: ch.type,
            parent: cat,
            permissionOverwrites: [{
              id: everyoneRole.id,
              allow: SAILOR_PERMISSIONS,
            }],
          })),
        );
      },
    ));

    ch.data.private.map(pc => guild.channels.create(pc.category, { type: 'category' }).then(
      async cat => {
        await Promise.all(
          pc.channels.map(async e => {
            const allRolesExcept = await guild.roles.cache.filter(role => role.name !== SETUP_ROLES[0].name || role.name !== SETUP_ROLES[1].name);
            const denyPermissionOverwrites = allRolesExcept.map(role => ({ id: role.id, deny: ['VIEW_CHANNEL'] }));

            const allowPermissionOverwrites = [
              { id: captain.id, allow: CAPTAIN_PERMISSIONS },
              { id: pirate.id, allow: PIRATE_PERMISSIONS },
            ];

            const permissionOverwrites = _.concat(denyPermissionOverwrites, allowPermissionOverwrites);

            return guild.channels.create(e, {
              type: ch.type,
              permissionOverwrites,
              parent: cat,
            });
          }),
        );
      },
    ));
  });

  // create cohort channels
  await guild.channels.create('cohorts 🏡', { type: 'category' }).then(
    async categoryChannel => {
      await Promise.all(
        cohortNameIds.map(async e => {
          const allRolesExceptCurrentCohort = await guild.roles.cache.filter(role => (role.name !== e && cohortNameIds.includes(role.name))
               || role.name === '@everyone');

          const cohortRole = await findRole({ guild_id, name: e });

          const denyPermissionOverwrites = allRolesExceptCurrentCohort.map(role => ({ id: role.id, deny: ['VIEW_CHANNEL'] }));

          const allowPermissionOverwrites = [
            { id: captain.id, allow: CAPTAIN_PERMISSIONS },
            { id: pirate.id, allow: PIRATE_PERMISSIONS },
            { id: cohortRole.id, allow: SAILOR_PERMISSIONS },
          ];

          const permissionOverwrites = _.concat(denyPermissionOverwrites, allowPermissionOverwrites);

          return guild.channels.create(e, {
            type: 'text',
            parent: categoryChannel,
            permissionOverwrites,
          });
        }),
      );
    },
  );

  return 'Setup Server Successful!';
};

export const createInvite = async ({ guild_id }) => {
  const guild = getGuild({ guild_id });
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
