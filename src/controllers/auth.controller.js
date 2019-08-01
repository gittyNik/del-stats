import jwt from 'jsonwebtoken';
import request from 'superagent';
import {getProfile} from '../models/user';

const sendAuthFailure = res => {
  res.header('WWW-Authenticate', 'Bearer realm="Access to Delta API"');
  res.status(401).send('Unauthenticated request!');
}

export const authenticate = (req, res, next) => {

  if(req.headers.authorization === undefined) {
    return sendAuthFailure(res);
  }

  let token = req.headers.authorization.split(' ').pop();
  jwt.verify(token, process.env.JWT_SECRET, (err, jwtData) => {
    if(err || !jwtData) {
      sendAuthFailure(res);
    } else {
      getProfile(jwtData.userId).then(profile =>{
        req.jwtData = jwtData;
        req.jwtData.user = profile;
        next();
      }).catch(err => sendAuthFailure(res));
    }
  });
}

export default authenticate;
