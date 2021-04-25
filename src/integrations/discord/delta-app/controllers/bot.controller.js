import client from '../client';

// eslint-disable-next-line import/prefer-default-export
export const createServer = async (name, { channels, icon, roles }) => client.guilds.create(name, { channels, icon, roles });
