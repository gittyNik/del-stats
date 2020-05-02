import Express from 'express';
import compression from 'compression';
import interaction from './handlers/interaction.handler';
import event from './handlers/event.handler';
import command from './handlers/command.handler';
import webRouter from './routes/webRouter';
// import options from './options.controller';


const router = Express.Router();

router.use('/action-endpoint', event);
router.use('/interactive-endpoint', interaction);
router.use('/command-endpoint', command);

// Apply body Parser
router.use(compression());
router.use(Express.json({
    limit: '20mb'
}));
router.use(Express.urlencoded({
    limit: '20mb',
    extended: false
}));

router.use('/web', webRouter)
// router.use('/options-endpoint', options);

export default router;