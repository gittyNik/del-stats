import Express from 'express';
import compression from 'compression';

import moment from 'moment';
import { Promise } from 'core-js';
import _ from 'lodash';
import logger from '../../../util/logger';
import { getLiveCohorts } from '../../../models/cohort';
import { SAILOR_PERMISSIONS, SETUP_ROLES, SETUP_CHANNELS } from './config';

import client from './client';
import routes from './routes';
import { delay } from './utils';

const router = Express.Router();

export const getCohortFormattedId = ({ data, program_type }) => data.filter(
  e => e.program_id === program_type,
).map(
  e => String(`${e.name}-${e.type}-${e.duration === 26 ? 'ft' : ''}${e.duration === 16 ? 'pt' : ''}-${moment(e.start_date).format('MMM')}-${moment(e.start_date).format('YY')}`).toLowerCase(),
);

client.on('ready', async () => {
  logger.info(`Bot client Logged in as ${client.user.tag}!`);

  const data = await getLiveCohorts();
  const cohortNameIds = getCohortFormattedId({ data, program_type: 'tep' });

  client.guilds.fetch('835155581303652392').then(
    async guild => {
      await guild.channels.cache.forEach(channel => channel.delete());
      // await guild.roles.cache.forEach(role => role.delete());

      // create setup roles
      // await Promise.all(
      //   SETUP_ROLES.map(e => guild.roles.create({
      //     data: {
      //       name: e.name,
      //       color: e.color,
      //       permissions: e.role,
      //     },
      //     reason: 'General Setup Role',
      //   })),
      // );

      // // // create cohort roles
      // await Promise.all(
      //   cohortNameIds.map(e => guild.roles.create({
      //     data: {
      //       name: e,
      //       color: 'BLURPLE',
      //       permissions: SAILOR_PERMISSIONS,
      //     },
      //     reason: 'cohort role for server setup',
      //   })),
      // );

      // // create setup channels
      // SETUP_CHANNELS.map(ch => {
      //   ch.data.public.map(c => guild.channels.create(c.category, { type: 'category' }).then(
      //     cat => Promise.all(
      //       c.channels.map(e => guild.channels.create(e, { type: ch.type }).then(
      //         channel => channel.setParent(cat.id),
      //       )),
      //     ),
      //   ));
      // });

      const captain = await guild.roles.cache.find(role => role.name === SETUP_ROLES[0].name);
      const pirate = await guild.roles.cache.find(role => role.name === SETUP_ROLES[1].name);
      const sailor = await guild.roles.cache.find(role => role.name === SETUP_ROLES[2].name);

      // create cohort channels
      guild.channels.create('cohorts 🏡', { type: 'category' }).then(
        async categoryChannel => {
          // const cohortRole = await guild.roles.cache.find(role => role.name === e);

          Promise.all(

            cohortNameIds.map(async e => {
              const allRolesExceptCurrentCohort = await guild.roles.cache.filter(role => role.name !== e
                && role.name !== '@everyone' && role.id !== sailor.id && cohortNameIds.includes(role.name));

              const denyPermissionOverwrites = allRolesExceptCurrentCohort.map(role => ({ id: role.id, deny: ['VIEW_CHANNEL'] }));

              await guild.channels.create(e, {
                type: 'text',
                parent: categoryChannel,
                permissionOverwrites: denyPermissionOverwrites,
              });
            }),
          );
        },
      );
    },
  );
});

client.on('rateLimit', async msg => {
  console.log('hi', msg);
});

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
