import Express from 'express';
import compression from 'compression';
import interactionController from './interaction.controller';
import eventController from './event.controller';
import webRouter from './routes/webRouter';
// import commandController from './command.controller';
// import optionsController from './options.controller';

const router = Express.Router();

router.use('/action-endpoint', eventController);
router.use('/interactive-endpoint', interactionController);

// Apply body Parser
router.use(compression());
router.use(Express.json({
  limit: '20mb',
}));
router.use(Express.urlencoded({
  limit: '20mb',
  extended: false,
}));

router.use('/web', webRouter);
// router.use('/command-endpoint', commandController);
// router.use('/options-endpoint', optionsController);

export default router;
