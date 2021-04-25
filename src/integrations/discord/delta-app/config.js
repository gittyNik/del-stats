// eslint-disable-next-line import/prefer-default-export

export const SCOPES = Object.freeze({
  EMAIL: 'email',
  IDENTIFY: 'identify',
  CONNECTIONS: 'connections',
  BOT: 'bot',
});

export const config = (scopes, redirectUri) => Object.freeze({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  accessTokenUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/token`,
  authorizationUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/authorize`,
  redirectUri,
  scopes,
});

export const botConfig = Object.freeze({
  token: process.env.DISCORD_BOT_TOKEN,
});
