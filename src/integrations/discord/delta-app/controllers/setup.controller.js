import { Promise } from 'core-js';
import {
  SAILOR_PERMISSIONS, SETUP_ROLES, SETUP_CHANNELS, PIRATE_PERMISSIONS, CAPTAIN_PERMISSIONS,
  PROGRAM_NAMES,
} from '../config';
import { createRole, findRole } from './role.controller';
import { getGuild } from './guild.controller';
import { getCohortFormattedId } from '../utils';
import {
  getLiveCohortsByProgramId,
} from '../../../../models/cohort';

export const createSetupRolesAndChannels = async (guild_id) => {
  const guild = await getGuild({ guild_id });

  let everyoneRole = await findRole({ guild_id, name: '@everyone' });
  let captain = await findRole({ guild_id, name: SETUP_ROLES[0].name });
  let pirate = await findRole({ guild_id, name: SETUP_ROLES[1].name });

  if (captain || pirate) {
    throw new Error('Setup Role(s) Already Exist!');
  }

  // create setup roles
  await Promise.all(
    SETUP_ROLES.map(element => createRole({
      data: {
        name: element.name,
        color: element.color,
        permissions: element.role,
      },
      reason: 'General Setup Role',
      guild_id,
    })),
  );

  captain = await findRole({ guild_id, name: SETUP_ROLES[0].name });
  pirate = await findRole({ guild_id, name: SETUP_ROLES[1].name });

  // create setup channels
  SETUP_CHANNELS.map(async ch => {
    ch.data.public.map(c => guild.channels.create(c.category, { type: 'category' }).then(
      async cat => {
        await Promise.all(
          c.channels.map(element => guild.channels.create(element, {
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
          pc.channels.map(async element => {
            const allRolesExcept = await guild.roles.cache.filter(role => role.name !== SETUP_ROLES[0].name || role.name !== SETUP_ROLES[1].name);
            const denyPermissionOverwrites = allRolesExcept.map(role => ({ id: role.id, deny: ['VIEW_CHANNEL'] }));

            const allowPermissionOverwrites = [
              { id: captain.id, allow: CAPTAIN_PERMISSIONS },
              { id: pirate.id, allow: PIRATE_PERMISSIONS },
            ];

            const permissionOverwrites = [...denyPermissionOverwrites, ...allowPermissionOverwrites];

            return guild.channels.create(element, {
              type: ch.type,
              permissionOverwrites,
              parent: cat,
            });
          }),
        );
      },
    ));
  });

  return 'Setup Roles & Channels Successful!';
};

export const createProgramRoles = async (guild_id, program_ids) => {
  const colors = '16_777_215';
  // create setup roles
  await Promise.all(
    program_ids.map(element => createRole({
      data: {
        name: PROGRAM_NAMES.find(nm => nm.id === element).name,
        color: Math.floor(Math.random() * Number(colors)).toString(16),
        permissions: SAILOR_PERMISSIONS,
      },
      reason: 'Setup Program Role',
      guild_id,
    })),
  );

  return 'Added Program Roles';
};

export const createCohortRolesAndChannels = async (guild_id, program_id) => {
  const guild = await getGuild({ guild_id });

  const data = await getLiveCohortsByProgramId(program_id);
  const cohortNameIds = getCohortFormattedId({ data });

  const everyoneRole = await findRole({ guild_id, name: '@everyone' });
  const captain = await findRole({ guild_id, name: SETUP_ROLES[0].name });
  const pirate = await findRole({ guild_id, name: SETUP_ROLES[1].name });

  if (!everyoneRole || !captain || !pirate) {
    // Will only run successfully if the SETUP Roles exist in the server
    throw new Error('Setup Roles not found');
  }

  // create cohort roles
  await Promise.all(
    cohortNameIds.map(element => createRole({
      data: {
        name: element,
        color: 'BLURPLE',
        permissions: SAILOR_PERMISSIONS,
      },
      reason: 'cohort role for server setup',
      guild_id,
    })),
  );

  const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === program_id).name });

  // create cohort channels
  await guild.channels.create(`${PROGRAM_NAMES.find(name => program_id === name.id).sf} cohorts 🏡`, {
    type: 'category',
    permissionOverwrites: [
      { id: captain.id, allow: CAPTAIN_PERMISSIONS },
      { id: pirate.id, allow: PIRATE_PERMISSIONS },
      { id: programRole.id, allow: SAILOR_PERMISSIONS },
      { id: everyoneRole.id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
    ],
  }).then(
    async categoryChannel => {
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
          ];

          const permissionOverwrites = [...denyPermissionOverwrites, ...allowPermissionOverwrites];

          return guild.channels.create(element, {
            type: 'text',
            parent: categoryChannel,
            permissionOverwrites,
          });
        }),
      );
    },
  );

  return `Cohort Setup for ${program_id} in Server ${guild} Successful!`;
};
