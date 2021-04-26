import Express from 'express';
import compression from 'compression';

import client from './client';
import routes from './routes';

const router = Express.Router();

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong 🏓');
  }
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
