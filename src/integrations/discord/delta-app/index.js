import Express from 'express';
import compression from 'compression';
import oauth2Route from './routes/oauth.route';
import client from './client';

const router = Express.Router();

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

router.get('/', (req, res) => res.send({ data: 'hello' }));

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

router.use('/oauth', oauth2Route);

export default router;
