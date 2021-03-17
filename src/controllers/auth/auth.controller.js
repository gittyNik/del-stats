import jwt from 'jsonwebtoken';
import { getLimitedDetailsOfUser } from '../../models/user';
import logger from '../../util/logger';

const sendAuthFailure = (res) => {
  res.header('WWW-Authenticate', 'Bearer realm="Access to Delta API"');
  res.status(401).send('Unauthenticated request!');
};

export const authenticateRequest = (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return sendAuthFailure(res);
  }

  const token = req.headers.authorization.split(' ').pop();
  jwt.verify(token, process.env.JWT_SECRET, (err, jwtData) => {
    if (err || !jwtData) {
      // logger.error(err);
      console.warn('User is not authorized');
      sendAuthFailure(res);
    } else {
      getLimitedDetailsOfUser(jwtData.userId)
        .then((user) => {
          req.jwtData = { user, ...jwtData };
          return next();
        }).catch((e) => {
          console.warn('User is not authorized');
          sendAuthFailure(res);
        });
    }
  });

  return 0;
};

export default authenticateRequest;
