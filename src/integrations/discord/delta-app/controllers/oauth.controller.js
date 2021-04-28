import ClientOAuth2 from 'client-oauth2';
import { OAUTH_SCOPES } from '../config/constants';
import { oAuthConfig, OAuthRedirects } from '../config';

export const discordOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(oAuthConfig({
  scopes: [OAUTH_SCOPES.EMAIL, OAUTH_SCOPES.IDENTIFY, OAUTH_SCOPES.CONNECTIONS, OAUTH_SCOPES.GUILDS_JOIN],
  redirectUri: OAuthRedirects.discordOAuth2,
  state,
  query: {
    prompt,
  },
}));

export const discordBotOAuth2 = ({ state, prompt = 'concent' }) => new ClientOAuth2(oAuthConfig({
  scopes: [OAUTH_SCOPES.BOT],
  redirectUri: OAuthRedirects.discordBotOAuth2,
  state,
  query: {
    prompt,
    permissions: 8,
  },
}));
