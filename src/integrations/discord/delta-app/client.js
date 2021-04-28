import Discord from 'discord.js';
import { botConfig } from './config';
import logger from '../../../util/logger';
// eslint-disable-next-line import/prefer-default-export

const client = new Discord.Client();

client.login(botConfig.token);

export default client;
