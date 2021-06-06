// eslint-disable-next-line import/prefer-default-export

import { getCohortFromId } from '../../../../models/cohort';
import { getGuildIdFromProgram } from '../controllers/guild.controller';
import { findRole } from '../controllers/role.controller';
import { getCohortFormattedId } from '../utils';
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
  discordOAuth2: process.env.DISCORD_FE_BASE_PATH + process.env.DISCORD_OAUTH2_REDIRECT,
  discordBotOAuth2: process.env.DISCORD_FE_BASE_PATH + process.env.DISCORD_BOT_OAUTH2_REDIRECT,
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
  { name: 'Captain', role: CAPTAIN_PERMISSIONS, color: '#F8C300' },
  { name: 'Pirate', role: PIRATE_PERMISSIONS, color: '#FD0061' },
  { name: 'Sailor', role: SAILOR_PERMISSIONS, color: '#00D166' },
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
        'look-what-I-found 📂', 'show-off-what-you-built 🚀', 'learning-resources 📚',
        'mind-overflow 🧠', 'get-help 🆘', 'watercooler 🌊'],
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
export const BREAKOUT_TEMPLATE = async (cohort_id) => {
  const text = 'It\'s time to get your thinking hats on! Please join the BreakOut from DELTA now';

  // find cohort role and mention them
  const cohort = await getCohortFromId(cohort_id);
  const cohortChannelName = getCohortFormattedId({ data: [cohort] });
  const guild_id = getGuildIdFromProgram({ program_id: cohort.program_id });
  const cohortChannel = await findRole({ guild_id, name: cohortChannelName[0] });

  const updatedText = cohort_id ? `${cohortChannel} ${text}` : text;

  return updatedText;
};
export const LEARNER_BREAKOUT_TEMPLATE = (learner) => `Catalyst is reminding <@${learner}> to join the breakout. Please join from Delta`;
export const QUESTIONAIRE_TEMPLATE = 'The Question Hour is upon us. Please join the session from DELTA and ask away!';
export const ATTENDANCE_TEMPLATE = (learner, topics, timeMinutes) => `<@${learner}> Looks like you have been in the breakout on ${topics} for only ${timeMinutes} minutes.`;
export const ASSESSMENT_MESSAGE_TEMPLATE = (channel, phase, date, currentDay, topicsString) => {
  const title = `Your ${phase} Reflection Week begins on ${date}.`;

  const fields = [{
    name: `Hello, ${channel.toString()}!`,
    value: `In this week, from ${currentDay}, ${date} for one week, you will get time to reflect on your growth so far.`,
  }, {
    name: '~ *What will happen in this week?*',
    value: `${phase} Assessments. You will be participating in 1-on-1 review calls, and receiving feedback on your learning progress thus far.`,
  }, {
    name: 'What to expect in the Assessment',
    value: `An external reviewer will be asking some questions related to the Milestones covered in the ${phase}. \n You may also be asked to write code for some of these topics:\n\n${topicsString}`,
  }, {
    name: 'What happens after the Assessment?',
    value: `At the end this week, you will receive your Assessment feedback. \n Based on this feedback, some of you may be asked to join a new cohort and spend more time working on your ${phase} milestones. Because everyone learns at their own pace, needing more time isn't a bad thing. This is not a punishment.`,
  }, {
    name: 'To make the most of this week, here\'s what we suggest you do before, and even after, your assessment:',
    value: `Revisit MS Review feedback for each milestone of the ${phase}. \n Evaluate whether or not you were able to implement the MS Review feedback in the next MS. `,
  }, {
    name: 'Did you find it helpful?',
    value: 'Practice! Practice! Practice! Reading code is helpful, but what\'s even better is writing it. \n Go back to your MiniMS, attempt more, revisit the ones you have already attempted and try improving upon them.\n Pick a MS you feel you could have built better and try building it on your own. \n Please add your queries, if any, message below, and we\'ll get to addressing them.',
  }];

  const footer = '~ Note: There will be no BreakOuts or Mindcasts scheduled for you this week.\n You may see some on DELTA but they will soon be rescheduled and moved to next week. You will have access to your catalysts/educators to get guidance on anything you may be stuck with.';

  return { title, fields, footer };
};

export const EMBED_MESSAGE_URL = 'https://delta.soal.io/';
export const EMBED_MESSAGE_LOGO = 'https://coursereport-s3-production.global.ssl.fastly.net/uploads/school/logo/450/original/SOAL_SYMBOL-05.png';

// either multiple ids for multiple Programs
// or single id for single program id
export const GUILD_IDS_BY_PROGRAM = [{
  PROGRAM_ID: 'tep',
  GUILD_ID: process.env.DISCORD_TEP_GUILD_ID,
}, {
  PROGRAM_ID: 'design',
  GUILD_ID: process.env.DISCORD_TEP_GUILD_ID,
}];

export const PROGRAM_NAMES = [{
  name: 'Product Engineering',
  id: 'tep',
  sf: 'PE',
}, {
  name: 'Product Designing',
  id: 'design',
  sf: 'PD',
}];

// discord bot for focus forest or voice broadcast, only yt urls for now
export const VOICE_URLS = ['https://www.youtube.com/watch?v=XxP8kxUn5bc', 'https://www.youtube.com/watch?v=R0NME9W3cR4', 'https://www.youtube.com/watch?v=q33Ns5uG3yU'];
