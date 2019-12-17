import jwt from 'jsonwebtoken';
import { User } from '../../models/user';

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
      console.error(err);
      sendAuthFailure(res);
    } else {
      User.findByPk(jwtData.userId, { raw: true })
        .then((user) => {
          req.jwtData = { user, ...jwtData };
          return next();
        }).catch((e) => {
          console.error(e);
          sendAuthFailure(res);
        });
    }
  });

  return 0;
};

export default authenticateRequest;
