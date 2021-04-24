import ClientOAuth2 from 'client-oauth2';
import Discord from 'discord.js';
import { config, SCOPES } from './config';

// eslint-disable-next-line import/prefer-default-export

const client = new Discord.Client();

export const discordOAuth2 = new ClientOAuth2(config([SCOPES.EMAIL, SCOPES.IDENTIFY, SCOPES.CONNECTIONS]));
export const discordBotOAuth2 = new ClientOAuth2(config([SCOPES.BOT]));

export default client;
