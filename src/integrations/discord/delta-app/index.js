import Express from 'express';
import compression from 'compression';
import logger from '../../../util/logger';
import routes from './routes';
import { delay } from './utils';
import client from './client';
import { welcomeMember } from './controllers/bot.controller';
import { focusForest } from './controllers/voice.controller';
import { setPresence } from './controllers/presence.controller';

const router = Express.Router();

client.on('ready', async () => {
  logger.info(`Bot client Logged in as ${client.user.tag}!`);
  await setPresence(client.user, client);
});

client.on('rateLimit', async () => {
  logger.info(`Bot client ${client.user.tag}! Got Rate limited!`);
});

client.on('guildMemberAdd', member => welcomeMember({ member }));

// dm & server both message
client.on('message', async message => {
  await delay(1000);

  try {
    if (message.content === 'ping') {
      await message.reply('pong 🏓');
    } if (message.channel.type === 'dm') {
      await delay(1000);
      await message.reply('You are DMing me now!');
    }
  } catch (error) {
    console.error('message listener error', error);
  }
});

client.on('voiceStateUpdate', focusForest);

// Apply body Parser
router.use(compression());
router.use(Express.json({
  limit: '20mb',
}));
router.use(Express.urlencoded({
  limit: '20mb',
  extended: false,
}));

router.use('/', routes);

export default router;

process.on('unhandledRejection', error => {
  console.error('didn\'t catchUnhandled promise rejection DISCORD:', error);
});
