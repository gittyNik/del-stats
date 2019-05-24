import Express from 'express';
import jwt from 'jsonwebtoken';
import {accessControl, authenticate, signinWithGithub, signinWithMobile ,verifyOtp} from '../controllers/auth.controller';
import AUTH_SCOPES from '../util/authScopes';

const router = Express.Router();

router.use(accessControl);

// This route doesn't need to be authenticated
router.use('/oauth/github/signin', signinWithGithub);
router.use('/phone', signinWithMobile)
router.use('/verify', verifyOtp)
router.use(authenticate);

// Restrict students in these routes
router.use('/cohorts', (req, res, next) => {
  if(req.jwtData.scope === AUTH_SCOPES.STUDENT){
    // res.sendStatus(403);
  }
  next();
});

export default router;
