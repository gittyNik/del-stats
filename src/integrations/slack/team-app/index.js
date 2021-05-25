import Express from 'express';
import interactionController from './interaction.controller';
import eventController from './event.controller';
import webRouter from './routes/webRouter';
// import commandController from './command.controller';
// import optionsController from './options.controller';

const router = Express.Router();

router.use('/action-endpoint', eventController);
router.use('/interactive-endpoint', interactionController);
router.use('/team/web', webRouter);
// router.use('/command-endpoint', commandController);
// router.use('/options-endpoint', optionsController);

export default router;
