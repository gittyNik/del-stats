import Express from 'express';
import jwt from 'jsonwebtoken';
import request from 'superagent';
import { User, USER_ROLES } from '../models/user';
import { getSpotterTeam } from './user.controller';
import {getSoalToken} from '../util/token';

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


// This is the first request made in the sign in process. A token will be sent back to the frontend for authentication with github
export const signinWithGithub = (req, res)=>{

  let params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code
  };

  request.post('https://github.com/login/oauth/access_token').send(params)
  .then(getProfileFromGithub)
  .then(async ({user, profile, githubToken}) => {

    const spotterTeam = await getSpotterTeam(user);

    // User found. Sending a jsonwebtoken to the client!
    const soalToken = getSoalToken(user, githubToken);
    if(user.profile && user.profile.github){
      return res.send({soalToken, user: {...user.toObject(), spotterTeam}});
    }
    // new user signed up
    user.profile = { ...user.profile, github: profile };
    // Updating user with the github profile
    user.save().then(user=>{
      // Update succeeded
      res.send({soalToken, user: {...user.toObject(), spotterTeam}});
    }).catch(err => {
      // Update Failed!!!
      res.send({soalToken, user: {...user.toObject(), spotterTeam}})
    });
  }).catch(err => {
    console.log(err)
    res.status(404).send('User not found!!!');
  })

}
