import Express from 'express';
import oauth2Route from './oauth.route';

const router = Express.Router();

router.get('/', (req, res) => res.send({ hello: 'world' }));

router.use('/oauth', oauth2Route);

export default router;
