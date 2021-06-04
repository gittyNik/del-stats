import Express from 'express';

import oauth2Route from './oauth.route';
import guildRoute from './guild.route';
import botRoute from './bot.route';
import channelRoute from './channel.route';
import userRoute from './user.route';
import roleRoute from './role.route';

const router = Express.Router();

router.use('/oauth', oauth2Route);
router.use('/guild', guildRoute);
router.use('/bot', botRoute);
router.use('/channel', channelRoute);
router.use('/user', userRoute);
router.use('/role', roleRoute);

export default router;
