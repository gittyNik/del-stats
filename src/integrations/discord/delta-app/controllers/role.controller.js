/* eslint-disable import/prefer-default-export */

import { getGuild } from './guild.controller';

export const findRole = async ({ guild_id, name }) => {
  // if no role is passed then find all roles
  const guild = await getGuild({ guild_id });
  if (name) {
    const role = await guild.roles.cache.find(ro => ro.name === name);
    return role;
  }
  return guild.roles.cache.find(role => role);
};

// constants role permissions
export const createRole = ({
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

  const guild = getGuild({ guild_id });
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

  console.log(user);

  const newUser = await await user.roles.add(role.id);
  return newUser;
};
