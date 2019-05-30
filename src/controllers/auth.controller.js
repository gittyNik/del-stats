import Express from 'express';
import jwt from 'jsonwebtoken';
import request from 'superagent';
//import { User, USER_ROLES } from '../models/user';
import {getSpotterTeam} from './user.controller';
import {getSoalToken} from '../util/token';
import User from '../models/user.seq';
import SendOtp from '../util/sendotp';
import dotenv from 'dotenv/config';
const sendOtp = new SendOtp(process.env.SEND_OTP_API_KEY,"Use {{otp}} to login with DELTA . Please do not share it with anybody ");

export const accessControl = (req, res, next) => {

  res.header('Access-Control-Allow-Origin', process.env.REACT_APP_SERVER);
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');


  // Send `No Content` to preflight requests
  if (req.method === 'OPTIONS') {
    res.send(204);
  } else {
    next();
  }

}

export const authenticate = (req, res, next) => {
  req.jwt = {

  };
  next();
  /* 
  if(req.headers.authorization === undefined) {
     res.status(401).send('Unauthenticated request!');
   }

   let token = req.headers.authorization.split(' ').pop();
   jwt.verify(token, process.env.JWT_SECRET, (err, jwtData) => {
     if(err || !jwtData) {
       res.status(401).send('Unauthenticated request!');
     } else {
       req.jwtData = jwtData;
       next();
     }
   });
   */
}

const getProfileFromGithub = ({text: githubToken}) => new Promise((resolve, reject) => {

  request.get('https://api.github.com/user?'+githubToken).then(profileResponse => {
    const {email, login, id, name, company, location, bio, avatar_url} = profileResponse.body;
    const profile = {email, login, id, name, company, location, bio, avatar_url};

    User.findOne({email}).then(user => {
      if(user === null){
        // User not found. Checking alternate emails!
        request.get('https://api.github.com/user/emails?'+githubToken).then(emailResponse => {
          let emails = emailResponse.body.map(o=>o.email);
          User.findOne({email: {$in: emails}}).then(user=>{
            if(user === null){
              reject();
            } else {
              // user.emails = emails;
              resolve({user, profile, githubToken});
            }
          })
          .catch(reject);
        });
      } else {
        resolve({user, profile, githubToken});
      }
    })
    .catch(reject);
  })
  .catch(reject);

});


export const send = (req, res) => {

  req.jwt = {
     
  };
// send and verify methods are POST 
  sendOtp.setOtpExpiry(5);
  sendOtp.send(req.body.phone, "SOALIO", function (error, data) {

     console.log(data)
    res.send(data)
  })
  
}


export const retry = (req, res) => {
   //retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS 
  sendOtp.retry(req.body.phone, req.body.retryVoice, function(error, data) {
    console.log(data)
    res.send(data)
  })
}


export const verify = (req, res) => {
  sendOtp.verify(req.body.phone, req.body.otp, function (error, data) {
    console.log(data); // data object with keys 'message' and 'type'
    if (data.type == 'success') {
      console.log('OTP verified successfully')
      User.findOne({
        where: {
          phone: req.body.phone
        }
      })
      .then(d => {
        // to access data r.users.name/email/phone/role
        if (d == null) {
          if(req.body.apply == "true"){
            User.create({
              phone: req.body.phone,
              role: "Applicant",
            })
            .then(d =>
              res.json(d)
                //create jwt token
                )
          }
          else{
            User.create({
              phone: req.body.phone,
              role: "Community",
            })
            .then(d =>
              res.json(d)
                //create jwt token
                )
          }
          
         } 
         else {
            res.json(d)
            //create jwt token
         }
        }).catch(e => console.log(e))
      }
      if (data.type == 'error') console.log('OTP verification failed')
    })
  }
   

    // This is the first request made in the sign in process. A token will be sent back to the frontend for authentication with github
export const signinWithGithub = (req, res) => {
  
  let params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code
  };
  request.post('https://github.com/login/oauth/access_token').send(params)
  .then(getProfileFromGithub)
  .then(async ({
    user,
    profile,
    githubToken
  }) => {
    const spotterTeam = await getSpotterTeam(user);

      // User found. Sending a jsonwebtoken to the client!
    const soalToken = getSoalToken(user, githubToken);
    if (user.profile && user.profile.github) {
      return res.send({
        soalToken,
        user: {
          ...user.toObject(),
          spotterTeam
        }
      });
    }
    // new user signed up
    user.profile = {
      ...user.profile,
      github: profile
    };
    // Updating user with the github profile
    user.save().then(user => {
      // Update succeeded
      res.send({
        soalToken,
        user: {
          ...user.toObject(),
          spotterTeam
        }
      });
    }).catch(err => {
      // Update Failed!!!
      res.send({
        soalToken,
        user: {
          ...user.toObject(),
          spotterTeam
        }
      })
    });
  }).catch(err => {
    console.log(err)
    res.status(404).send('User not found!!!');
  })

}