import ClientOAuth2 from 'client-oauth2';
import { config, SCOPES, OAuthRedirects } from '../config';

export const discordOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(config({
  scopes: [SCOPES.EMAIL, SCOPES.IDENTIFY, SCOPES.CONNECTIONS],
  redirectUri: OAuthRedirects.discordOAuth2,
  state,
  query: {
    prompt,
  },
}));

export const discordBotOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(config({
  scopes: [SCOPES.BOT],
  redirectUri: OAuthRedirects.discordOAuth2,
  state,
  query: {
    prompt,
  },
}));
