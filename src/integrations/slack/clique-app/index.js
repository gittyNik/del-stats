import Express from 'express';
import logger from '../../../util/logger';
// import interactionController from './interaction.controller';
// import eventController from './event.controller';
// import commandController from './command.controller';
// import optionsController from './options.controller';

const router = Express.Router();

router.use('/', (req, res) => {
  logger.info('Clique app not ready');
  res.sendStatus(404);
});

// router.use('/action-endpoint', eventController);
// router.use('/interactive-endpoint', interactionController);
// router.use('/command-endpoint', commandController);
// router.use('/options-endpoint', optionsController);

export default router;
