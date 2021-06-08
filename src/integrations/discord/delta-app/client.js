import Discord from 'discord.js';
import { botConfig } from './config';

const client = new Discord.Client();

client.login(botConfig().token);

export default client;
