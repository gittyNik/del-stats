import ClientOAuth2 from 'client-oauth2';
import { config, SCOPES } from '../config';

export const discordOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(config({
  scopes: [SCOPES.EMAIL, SCOPES.IDENTIFY, SCOPES.CONNECTIONS],
  redirectUri: 'http://localhost:3000/integrations/discord/delta/oauth/redirect',
  state,
  query: {
    prompt,
  },
}));

export const discordBotOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(config({
  scopes: [SCOPES.BOT],
  redirectUri: 'http://localhost:3000/integrations/discord/delta/oauth/bot-redirect',
  state,
  query: {
    prompt,
  },
}));
