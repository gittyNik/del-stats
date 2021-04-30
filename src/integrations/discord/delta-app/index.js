import Express from 'express';
import compression from 'compression';

import logger from '../../../util/logger';
import routes from './routes';
import { delay } from './utils';
import client from './client';

// import { serverSetup } from './controllers/guild.controller';
import { welcomeMember } from './controllers/bot.controller';

const router = Express.Router();

client.on('ready', async () => {
  logger.info(`Bot client Logged in as ${client.user.tag}!`);
  // const data = await getTodaysCohortBreakouts();
  console.log('data');
  // serverSetup({ guild_id: process.env.DISCORD_TEP_GUILD_ID, program_type: 'tep' });
});

client.on('rateLimit', async msg => {
  console.log('hi', msg);
});

client.on('guildMemberAdd', welcomeMember);

// dm & server both message
client.on('message', async msg => {
  await delay(1000);

  try {
    if (msg.content === 'ping') {
      await msg.reply('pong 🏓');
    } if (msg.channel.type === 'dm') {
      await msg.author.send('You are DMing me now!');
    }
  } catch (err) {
    console.error('message listener error', err);
  }
});

process.on('unhandledRejection', error => {
  console.error('didn\'t catchUnhandled promise rejection:', error);
});

// router.use('/action-endpoint', event);
// router.use('/interactive-endpoint', interaction);
// router.use('/command-endpoint', command);

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
