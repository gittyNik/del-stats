import Express from 'express';
import request from 'superagent';
import uuid from 'uuid/v4';
import { getSoalToken } from '../util/token';
import { User, getUserFromEmails } from '../models/user';
import { SocialConnection, PROVIDERS } from '../models/social_connection';

const router = Express.Router();

const getGithubAccessToken = (code) => {
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  };

  return request.post('https://github.com/login/oauth/access_token').send(params)
    .then(tokenResponse => ({
      githubToken: tokenResponse.text,
      expiry: tokenResponse.expiry, // TODO: need to check if this key is correct
    }));
};

const fetchProfileFromGithub = ({ githubToken, expiry }) =>
  // TODO: reject if expired

  // fetching profile details from github
  request.get(`https://api.github.com/user?${githubToken}`)
    .then((profileResponse) => {
      const profile = profileResponse.body;
      // fetching all emails from github
      return request.get(`https://api.github.com/user/emails?${githubToken}`)
        .then((emailResponse) => {
          profile.emails = emailResponse.body.map(o => o.email);
          return { profile, githubToken, expiry };
        });
    });


// fetch profile and add it to social_connections
const addGithubProfile = ({
  profile, githubToken, expiry, user,
}) => SocialConnection.create({
  id: uuid(),
  profile,
  access_token: githubToken,
  expiry,
  user_id: user.id,
  email: user.email,
  username: profile.username,
  provider: PROVIDERS.GITHUB,
  createdAt: new Date(),
  updatedAt: new Date(),
}, {})
  .then(socialConnection => ({ user, socialConnection }));

// An otp authenticated route to link github
export const linkWithGithub = (req, res) => {
  const { user } = req.jwtData;
  const { code } = req.query;

  getGithubAccessToken(code)
    .then(fetchProfileFromGithub)
    .then(({ profile, githubToken, expiry }) => {
      // If the current user's email is not found with github emails,
      // then authentication error should be sent as resopnse
      if (profile.emails.includes(user.email)) {
        return {
          profile, githubToken, expiry, user,
        };
      }
      return Promise.reject('INVALID_EMAIL');
    })
    .then(addGithubProfile)
    .then(({ user, socialConnection }) => {
    // TODO: Do any user updates here.
    // e.g. add avatar_url from github to user profile
      const { provider, username, email } = socialConnection;
      res.send({ data: { provider, username, email } });
    })
    .catch((err) => {
      if (err === 'INVALID_EMAIL') {
        res.send(401).send('Invalid email');
      } else {
        console.error(err);
        res.send(500);
      }
    });
};

// A non authenticated route to signin with github
// TODO: should handle 2 cases
// 1. We already have profile and get the user from there
// 2. We don't have profile, ask for otp authentication
export const signinWithGithub = (req, res) => {
  // const {user} = req.jwtData;
  const { code } = req.query;

  getGithubAccessToken(code)
    .then(fetchProfileFromGithub)
    .then(({ profile, githubToken, expiry }) =>
    // If no user's email is not found with github emails,
    // then authentication error should be sent as resopnse
      getUserFromEmails(profile.emails)
        .then((user) => {
          if (user === null) { return Promise.reject('NO_EMAIL'); }
          return {
            profile, githubToken, expiry, user,
          };
        }))
    .then(addGithubProfile) // TODO: this is adding social_connection for every signin
    .then(({ user, socialConnection }) => {
      res.send({
        user,
        soalToken: getSoalToken(user),
        provider: PROVIDERS.GITHUB,
      });
    })
    .catch((err) => {
      if (err === 'NO_EMAIL') {
        // TODO: if the user is not found with emails,
        // save the profile details in session and ask for otp authentication
        res.send(404).send('No user found with email');
      } else {
        console.error(err);
        res.send(500);
      }
    });
};

