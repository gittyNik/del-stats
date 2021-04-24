import Express from 'express';
import compression from 'compression';
import oauth2Route from './routes/oauth.route';

const router = Express.Router();

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

router.use('/OAuth', oauth2Route);

export default router;
