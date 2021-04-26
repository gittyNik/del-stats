import Express from 'express';
import oauth2Route from './oauth.route';

const router = Express.Router();

router.use('/oauth', oauth2Route);
