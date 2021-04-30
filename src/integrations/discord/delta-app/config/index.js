// eslint-disable-next-line import/prefer-default-export

import { ROLE_PERMISSIONS } from './constants';

export const SCOPES = Object.freeze({
  EMAIL: 'email',
  IDENTIFY: 'identify',
  CONNECTIONS: 'connections',
  BOT: 'bot',
});

export const oAuthConfig = ({
  scopes, redirectUri, query, state,
}) => Object.freeze({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  accessTokenUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/token`,
  authorizationUri: `${process.env.DISCORD_BASE_API_URL}/oauth2/authorize`,
  redirectUri,
  scopes,
  query,
  state,
});

export const botConfig = Object.freeze({
  token: process.env.DISCORD_BOT_TOKEN,
});

export const OAuthRedirects = Object.freeze({
  discordOAuth2: process.env.DISCORD_OAUTH2_REDIRECT,
  discordBotOAuth2: process.env.DISCORD_BOT_OAUTH2_REDIRECT,
});

export default {
  DISCORD_BASE_API_URL: process.env.DISCORD_BASE_API_URL,
};

export const SAILOR_PERMISSIONS = [
  ROLE_PERMISSIONS.ADD_REACTIONS, ROLE_PERMISSIONS.STREAM, ROLE_PERMISSIONS.VIEW_CHANNEL, ROLE_PERMISSIONS.SEND_MESSAGES, ROLE_PERMISSIONS.EMBED_LINKS,
  ROLE_PERMISSIONS.ATTACH_FILES, ROLE_PERMISSIONS.READ_MESSAGE_HISTORY, ROLE_PERMISSIONS.USE_EXTERNAL_EMOJIS,
  ROLE_PERMISSIONS.CONNECT, ROLE_PERMISSIONS.SPEAK,
];

export const PIRATE_PERMISSIONS = [
  ROLE_PERMISSIONS.ADD_REACTIONS, ROLE_PERMISSIONS.STREAM, ROLE_PERMISSIONS.VIEW_CHANNEL, ROLE_PERMISSIONS.SEND_MESSAGES, ROLE_PERMISSIONS.EMBED_LINKS,
  ROLE_PERMISSIONS.ATTACH_FILES, ROLE_PERMISSIONS.READ_MESSAGE_HISTORY, ROLE_PERMISSIONS.USE_EXTERNAL_EMOJIS,
];

export const CAPTAIN_PERMISSIONS = [
  ROLE_PERMISSIONS.ADMINISTRATOR,
];

export const SETUP_ROLES = [
  { name: 'Captain', role: CAPTAIN_PERMISSIONS, color: 'GREEN' },
  { name: 'Pirate', role: PIRATE_PERMISSIONS, color: 'LUMINOUS_VIVID_PINK' },
  { name: 'Sailor', role: SAILOR_PERMISSIONS, color: 'AQUA' },
];

export const SETUP_CHANNELS = [{
  type: 'text',
  data: {
    public: [{
      category: 'Info',
      channels: ['announcements 📢', 'code of conduct 🚨', 'feedback 🧪'],
    }, {
      category: 'Typein\' ⌨',
      channels: ['welcome 👋',
        'watercooler 🌊', 'get-help 🆘',
        'look-what-I-found 📂', 'show-off-what-you-built 🚀', 'learning-resources 📚',
        'mind-overflow 🧠'],
    }],
    private: [{
      category: 'SOAL Team 👾',
      channels: ['discuss 🏳', 'moderation-logs ☢'],
    }],
  },
}, {
  type: 'voice',
  data: {
    private: [{
      category: 'SOAL Team Voice 🗣',
      channels: ['conference-room'],
    }],
    public: [{
      category: 'Listenin\' 🔊',
      channels: ['conference-room-1', 'conference-room-2', 'music-room 🎼', 'focus-forest 🌳'],
    }],
  },
}];

export const WELCOME_MESSAGES = [
  'welcome here!', 'I hope you got pizza for us 🍕',
];

export const REVIEW_TEMPLATE = (team_number) => `Team: ${team_number}, Reviewer is reminding you to join the review. Please join from DELTA`;
export const LEARNER_REVIEW_TEMPLATE = (learner) => `<@${learner}> Reviewer is reminding you to join the review. Please join from DELTA`;
export const ASSESSMENT_TEMPLATE = (learner) => `Psst! Looks like it's time for your Assessment, <@${learner}>. Please join from DELTA right away; your reviewer is waiting.`;
export const BREAKOUT_TEMPLATE = 'It\'s time to get your thinking hats on! Please join the BreakOut from DELTA now';
export const LEARNER_BREAKOUT_TEMPLATE = (learner) => `Catalyst is reminding <@${learner}> to join the breakout. Please join from Delta`;
export const QUESTIONAIRE_TEMPLATE = 'The Question Hour is upon us. Please join the session from DELTA and ask away!';
export const ATTENDANCE_TEMPLATE = (learner, topics, timeMinutes) => `<@${learner}> Looks like you have been in the breakout on ${topics} for only ${timeMinutes} minutes.`;

export const GUILD_IDS_BY_PROGRAM = [{
  PROGRAM_ID: 'tep',
  GUILD_ID: process.env.DISCORD_TEP_GUILD_ID,
}];
