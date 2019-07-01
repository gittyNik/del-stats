import Express from 'express';

const router = Express.Router();

router.use('/oauth', oauthRouter);
router.use('/otp', otpRouter);

export default router;
