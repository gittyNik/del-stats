import Express from 'express';
import moment from 'moment';

import oauth2Route from './oauth.route';
import guildRoute from './guild.route';
import botRoute from './bot.route';
import channelRoute from './channel.route';

const router = Express.Router();

export const getCohortFormattedId = ({ data, program_type }) => data.filter(
  e => e.program_id === program_type,
).map(
  e => `${e.name}-${e.type}-${e.duration === 26 ? 'ft' : ''}${e.duration === 16 ? 'pt' : ''}-${moment(e.start_date).format('MMM')}-${moment(e.start_date).format('YY')}`,
);

router.use('/oauth', oauth2Route);
router.use('/guild', guildRoute);
router.use('/bot', botRoute);
router.use('/channel', channelRoute);

export default router;
