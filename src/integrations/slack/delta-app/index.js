import Express from 'express';
import interaction from './handlers/interaction.handler';
import event from './handlers/event.handler';
import command from './handlers/command.handler';
// import options from './options.controller';

const router = Express.Router();

router.use('/action-endpoint', event);
router.use('/interactive-endpoint', interaction);
router.use('/command-endpoint', command);
// router.use('/options-endpoint', options);

export default router;
