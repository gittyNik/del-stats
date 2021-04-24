// eslint-disable-next-line import/prefer-default-export
export const config = () => Object.freeze({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  accessTokenUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/token`,
  authorizationUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/authorize`,
  redirectUri: 'http://localhost:3000/integrations/discord/delta/OAuth/redirect',
  scopes: ['email', 'identify', 'connections'],
});
