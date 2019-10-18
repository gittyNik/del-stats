import Express from 'express';
import oauthRouter from './oauth.routes';
import otpRouter from './otp.routes';

const router = Express.Router();

router.use('/oauth', oauthRouter);
router.use('/otp', otpRouter);

export default router;
