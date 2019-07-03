import Express from 'express';
import jwt from 'jsonwebtoken';
import request from 'superagent';
import {getSpotterTeam} from './user.controller';
import {getSoalToken} from '../util/token';
import User from '../models/user';
import SendOtp from '../util/sendotp';
import dotenv from 'dotenv/config';

const router = Express.Router();

const getProfileFromGithub = ({text: githubToken}) => new Promise((resolve, reject) => {

  request.get('https://api.github.com/user?'+githubToken).then(profileResponse => {
    const {email, login, id, name, company, location, bio, avatar_url} = profileResponse.body;
    const profile = {email, login, id, name, company, location, bio, avatar_url};
    User.findOne({email}).then(user => resolve({user, profile, githubToken}) )
    .catch(err=>{
      // User not found. Checking alternate emails!
      request.get('https://api.github.com/user/emails?'+githubToken).then(emailResponse => {
        let emails = emailResponse.body.map(o=>o.email);
        User.findOne({email: {$in: emails}}).then(user=>{
          user.emails = emails;
          resolve({user, profile, githubToken});
        } )
        .catch(reject);
      });
    });
  })
  .catch(reject);

});

// Check if a user with the github profile exists in the database and authorize
export const signinWithGithub = (req, res)=>{
  let params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code
  };

  request.post('https://github.com/login/oauth/access_token').send(params)
  .then(getProfileFromGithub)
  .then(({user, profile, githubToken}) => {
    // User found. Sending a jsonwebtoken to the client!
    const soalToken = jwt.sign({ user: user._id, githubToken }, process.env.JWT_SECRET);
    if(user.profile && user.profile.github){
      return res.send({soalToken, user});
    }
    // new user signed up
    user.profile = { ...user.profile, github: profile };
    // Updating user with the github profile
    user.save().then(user=>{
      // Update succeeded
      res.send({soalToken, user});
    }).catch(err => {
      // Update Failed!!!
      res.send({soalToken, user})
    });
  }).catch(err => {
    console.log(err)
    res.status(404).send('User not found!!!');
  })

}

export const linkWithGithub = signinWithGithub;
