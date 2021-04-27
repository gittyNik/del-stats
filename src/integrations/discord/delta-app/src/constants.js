/* eslint-disable import/prefer-default-export */
// https://github.com/discordjs/discord.js/blob/stable/src/util/Constants.js#L552

export const OAUTH_SCOPES = [
  'identify',
  'email',
  'connections',
  'guilds',
  'guilds.join',
  'gdm.join',
  'rpc',
  'rpc.notifications.read',
  'rpc.voice.read',
  'rpc.voice.write',
  'rpc.activities.write',
  'bot',
  'webhook.incoming',
  'messages.read',
  'applications.builds.upload',
  'applications.builds.read',
  'applications.commands',
  'applications.store.update',
  'applications.entitlements',
  'activities.read',
  'activities.write',
  'relationships.read',
];

export const ROLE_PERMISSIONS = {
  GENERAL: [
    'Administrator',
    'View Audit Log',
    'View Server Insights',
    'Manage Server',
    'Manage Roles',
    'View Channels',
    'Manage Webhooks',
  ],
  TEXT: [
    'Send Message',
    'Send TTS Messages',
    'Manage Messages',
    'Embed Links',
    'Attach Files',
    'Read Message History',
    'Mention Everyone',
    'Use External Emojis',
    'Add Reactions',
    'Use Slash Commands',
  ],
  VOICE: [
    'Connect',
    'Speak',
    'Video',
    'Mute Members',
    'Deafen Members',
    'Move Members',
    'Use Voice Activity',
    'Priority Speaker',
  ],
};

export default {
  OAUTH_SCOPES,
  ROLE_PERMISSIONS,
};
