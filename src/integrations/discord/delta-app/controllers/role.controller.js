/* eslint-disable import/prefer-default-export */

import { Cohort } from '../../../../models/cohort';
import logger from '../../../../util/logger';
import { PROGRAM_NAMES, SAILOR_PERMISSIONS } from '../config';
import { getCohortFormattedId } from '../utils';
import { getGuild, getGuildIdsFromProgramIds } from './guild.controller';

export const findRole = async ({ guild_id, name }) => {
  try {
  // if no role is passed then find all roles
    const guild = await getGuild({ guild_id });
    if (name) {
      const role = await guild.roles.cache.find(ro => ro.name === name);
      if (role && role.name) {
        return role;
      }
      throw new Error('no role found with name found!');
    }
    return guild.roles.cache.find(role => role);
  } catch (error) {
    logger.error(error);
    return false;
  }
};

// constants role permissions
export const createRole = async ({
  data, reason, guild_id,
}) => {
  const {
    name,
    color,
    permissions,
  } = data;

  if (!name && !permissions) {
    throw new Error('Please pass name and permission!');
  }

  const guild = await getGuild({ guild_id });
  return guild.roles.create({
    data: {
      name,
      color,
      permissions,
    },
    reason,
  });
};

export const deleteRole = async ({ guild_id, name }) => {
  // if no name passed then delete all roles
  const guild = await getGuild({ guild_id });

  if (name) {
    const role = await findRole(name);
    return role.delete();
  }

  return guild.roles.cache.forEach(role => role.delete());
};

export const addRoleToUser = async ({ guild_id, role_name, user_id }) => {
  const guild = await getGuild({ guild_id });
  const role = await findRole({ guild_id, name: role_name });
  const user = await guild.members.fetch(user_id);

  if (!user && !role && !guild) {
    throw new Error('User not in server!');
  }

  const newUser = await user.roles.add(role.id);
  return newUser;
};

export const removeRoleFromUser = async ({ guild_id, role_name, user_id }) => {
  const guild = await getGuild({ guild_id });
  const role = await findRole({ guild_id, name: role_name });
  const user = await guild.members.fetch(user_id);

  if (!user && !role && !guild) {
    throw new Error('User not in server!');
  }

  const newUser = await user.roles.remove(role.id);
  return newUser;
};

export const createProgramRole = async ({ guild_id, program_id }) => {
  const colors = '16_777_215';
  // create setup roles
  return createRole({
    data: {
      name: PROGRAM_NAMES.find(nm => nm.id === program_id).name,
      color: Math.floor(Math.random() * Number(colors)).toString(16),
      permissions: SAILOR_PERMISSIONS,
    },
    reason: 'Setup Program Role',
    guild_id,
  });
};

export const createCohortRole = async ({ cohort_id }) => {
  const cohort = await Cohort.findOne({
    where: {
      id: cohort_id,
    },
  }, { raw: true });

  const guild_ids = getGuildIdsFromProgramIds({ program_ids: [cohort.program.id] });
  const cohortNameIds = getCohortFormattedId({ data: [cohort] });

  // create cohort roles
  await Promise.all(
    cohortNameIds.map(element => createRole({
      data: {
        name: element,
        color: 'BLURPLE',
        permissions: SAILOR_PERMISSIONS,
      },
      reason: 'cohort role for server setup',
      guild_id: guild_ids[0],
    })),
  );
};
