import Express from 'express';

import oauth2Route from './oauth.route';
import guildRoute from './guild.route';
import botRoute from './bot.route';
import channelRoute from './channel.route';
import userRoute from './user.route';
import roleRoute from './role.route';

const router = Express.Router();

router.use('/delta/oauth', oauth2Route);
router.use('/delta/guild', guildRoute);
router.use('/delta/bot', botRoute);
router.use('/delta/channel', channelRoute);
router.use('/delta/user', userRoute);
router.use('/delta/role', roleRoute);

export default router;
