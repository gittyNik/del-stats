import Express from 'express';
import jwt from 'jsonwebtoken';
import request from 'superagent';
//import { User, USER_ROLES } from '../models/user';
import {getSpotterTeam} from './user.controller';
import {getSoalToken} from '../util/token';
import User from '../models/user';
import SendOtp from '../util/sendotp';
import dotenv from 'dotenv/config';
const sendOtp = new SendOtp(process.env.MSG91_API_KEY,"Use {{otp}} to login with DELTA . Please do not share it with anybody ");

export const authenticate = (req, res, next) => {

  if(req.headers.authorization === undefined) {
    res.header('WWW-Authenticate', 'Bearer realm="Access to Delta API"');
    res.status(401).send('Unauthenticated request!');
    return;
   }

   let token = req.headers.authorization.split(' ').pop();
   jwt.verify(token, process.env.JWT_SECRET, (err, jwtData) => {
     if(err || !jwtData) {
       res.header('WWW-Authenticate', 'Bearer realm="Access to Delta API"');
       res.status(401).send('Unauthenticated request!');
     } else {
       req.jwtData = jwtData;
       next();
     }
   });
}

export default authenticate;
