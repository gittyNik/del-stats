import Express from 'express';
import jwt from 'jsonwebtoken';
import request from 'superagent';
import {getSpotterTeam} from './user.controller';
import {getSoalToken} from '../util/token';
import {User, getProfile} from '../models/user';
import SendOtp from '../util/sendotp';
import dotenv from 'dotenv/config';
const sendOtp = new SendOtp(process.env.MSG91_API_KEY,"Use {{otp}} to login with DELTA . Please do not share it with anybody ");

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
    console.log(jwtData);
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
