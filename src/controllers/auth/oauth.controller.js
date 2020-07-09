import request from 'superagent';
import uuid from 'uuid/v4';
import dotenv from 'dotenv';
import { getSoalToken } from '../../util/token';
import {
  getUserFromEmails,
  USER_ROLES,
  getProfile,
} from '../../models/user';
import { SocialConnection, PROVIDERS, getUserIdByEmail } from '../../models/social_connection';
import { getCohortFromLearnerId } from '../../models/cohort';
import {
  createTeam,
  getTeamIdByName,
  sendInvitesToNewMembers,
  isEducator,
} from '../../integrations/github/controllers';
import { urlGoogle, getTokensFromCode } from '../../util/calendar-util';
import { createCalendarEventsForLearner } from '../../models/learner_breakout';
import { logger } from '../../util/logger';

dotenv.config();

const getGithubAccessToken = async code => {
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  };

  return request
    .post('https://github.com/login/oauth/access_token')
    .send(params)
    .then(tokenResponse => ({
      githubToken: tokenResponse.text,
      expiry: tokenResponse.expiry, // TODO: need to check if this key is correct
    }));
};

const fetchProfileFromGithub = ({ githubToken, expiry }) =>
  // TODO: reject if expired

  // fetching profile details from github
  request
    .get(`https://api.github.com/user?${githubToken}`)
    .then(async profileResponse => {
      const profile = profileResponse.body;
      // fetching all emails from github
      const emailResponse = await request
        .get(`https://api.github.com/user/emails?${githubToken}`);
      profile.emails = emailResponse.body.map(o => o.email);
      return { profile, githubToken, expiry };
    });

// fetch profile and add it to social_connections
const addGithubProfile = ({
  profile, githubToken, expiry, user,
}) => {
  const where = {
    user_id: user.id,
    provider: PROVIDERS.GITHUB,
  };

  // Insert if the provider is not connected, update if already connected
  return SocialConnection.findOne({ where })
    .then(socialConnection => {
      const updateValues = {
        profile,
        expiry,
        access_token: githubToken,
        updated_at: new Date(),
      };

      const newValues = {
        id: uuid(),
        email: user.email,
        username: profile.login,
        created_at: new Date(),
      };

      if (socialConnection) {
        return socialConnection.update(updateValues);
      }
      return SocialConnection.create({
        ...where,
        ...newValues,
        ...updateValues,
      });
    })
    .then(socialConnection => ({ user, socialConnection }));
};

const wrapParentTeamId = cohort => getTeamIdByName('Learners').then(parent_team_id => ({
  parent_team_id,
  cohort,
}));

const addTeamToExponentSoftware = async userProfile => {
  const isEdu = await isEducator(userProfile.socialConnection.username);
  if (isEdu) {
    return { userProfile, teamName: 'Educators' };
  }
  if (userProfile.user.role === 'catalyst' || userProfile.user.role === 'reviewer') {
    return { userProfile, teamName: userProfile.user.role, excluded: true };
  }
  return getCohortFromLearnerId(userProfile.user.id)
    .then(wrapParentTeamId)
    .then(({ parent_team_id, cohort }) => createTeam(
      cohort.name,
      cohort.program_id,
      cohort.location === 'T-hub, IIIT Hyderabad'
        ? 'Hyderabad'
        : cohort.location,
      cohort.start_date,
      parent_team_id,
    ))
    .then(teamName => ({ userProfile, teamName }));
};

const sendOrgInvites = async ({ userProfile, teamName, isExcluded = false }) => {
  const isEdu = await isEducator(userProfile.socialConnection.username);
  if (isEdu) {
    return userProfile;
  }
  if (isExcluded) {
    return userProfile;
  }
  return sendInvitesToNewMembers(
    userProfile.socialConnection.email,
    userProfile.socialConnection.username,
    teamName,
  ).then(() => userProfile);
};

// An otp authenticated route to link github
export const linkWithGithub = (req, res) => {
  const { user } = req.jwtData;
  const { code } = req.body;
  getGithubAccessToken(code)
    .then(fetchProfileFromGithub)
    .then(({ profile, githubToken, expiry }) => {
      // If the current user's email is not found with github emails,
      // then authentication error should be sent as resopnse
      if (profile.emails.includes(user.email)) {
        return {
          profile,
          githubToken,
          expiry,
          user,
        };
      }
      if (user.email === null) {
        // If the user doesn't have email, use email from github
        return {
          profile,
          githubToken,
          expiry,
          user: { ...user, email: profile.emails[0] },
        };
      }
      return Promise.reject('INVALID_EMAIL');
    })
    .then(addGithubProfile)
    .then(userProfile => {
      // {user, socialConnection}
      // TODO: Do any user updates here.
      // e.g. add avatar_url from github to user profile
      const {
        provider,
        username,
        email,
        profile,
      } = userProfile.socialConnection;
      res.send({
        data: {
          provider,
          username,
          email,
          profile,
        },
      });
    })
    .catch(err => {
      if (err.status === 401) {
        res.status(401).send(err.response.text);
      } else if (err === 'INVALID_EMAIL') {
        res.status(401).send('Invalid email');
      } else {
        res.sendStatus(500);
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

  // If no user's email is not found with github emails,
  // then authentication error should be sent as resopnse
  getGithubAccessToken(code)
    .then(fetchProfileFromGithub)
    // If no user's email is not found with github emails,
    // then authentication error should be sent as resopnse
    .then(({ profile, githubToken, expiry }) => getUserIdByEmail(profile.emails)
      .then(socialConnection => {
        if (socialConnection) {
          return getProfile(socialConnection.user_id);
        }
        return getUserFromEmails(profile.emails);
      })
      .then(user => {
        if (user === null || user.role === USER_ROLES.GUEST) {
          return Promise.reject('NO_EMAIL');
        }
        return {
          profile,
          githubToken,
          expiry,
          user,
        };
      }))
    .then(addGithubProfile)
    .then(addTeamToExponentSoftware)
    .then(sendOrgInvites)
    .then(({ user }) => {
      // {user, socialConnection}
      res.send({
        user,
        soalToken: getSoalToken(user),
        provider: PROVIDERS.GITHUB,
      });
    })
    .catch(err => {
      if (err.status === 401) {
        res.status(401).send(err.response.text);
      } else if (err === 'NO_EMAIL') {
        // TODO: if the user is not found with emails,
        // save the profile details in session and ask for otp authentication
        res.status(404).send('No user found with email');
      } else {
        console.error(`Sign in failed: ${err}`);
        res.status(500).send('Authentication Failed');
      }
    });
};

// fetch profile and add it to social_connections
const addGoogleProfile = ({
  profile, googleToken, expiry, user,
}) => {
  const where = {
    user_id: user.id,
    provider: PROVIDERS.GOOGLE,
  };

  // Insert if the provider is not connected, update if already connected
  return SocialConnection.findOne({ where })
    .then((socialConnection) => {
      const updateValues = {
        profile,
        expiry,
        access_token: googleToken,
        updated_at: new Date(),
      };

      const newValues = {
        id: uuid(),
        email: user.email,
        username: profile.login,
        created_at: new Date(),
      };

      if (socialConnection) { return socialConnection.update(updateValues); }
      return SocialConnection.create({ ...where, ...newValues, ...updateValues });
    })
    .then(socialConnection => ({ user, socialConnection }));
};

// checks if google proiver is present in social connection
// sends redirect url if not found.
export const checkGoogleOrSendRedirectUrl = async (req, res) => {
  const { userId } = req.jwtData;
  // console.log(req.jwtData);
  logger.info(' user_id: ', userId);
  const result = await SocialConnection.findOne({
    where: {
      user_id: userId,
      provider: PROVIDERS.GOOGLE,
    },
  })
    .then((socialConnection) => {
      if (socialConnection) {
        return {
          text: 'Google access Token exists',
          data: {
            redirectUrl: false,
          },
        };
      }
      logger.info('Google access token doesn\'t');
      return {
        text: 'Google access Token doesnt exist',
        data: {
          redirectUrl: urlGoogle(),
        },
      };
    })
    .catch(err => {
      logger.error(err);
      return {
        text: 'Error checking google access Token',
        data: {
          error: 'Error checking google access Token',
        },
      };
    });
  res.send(result);
};

export const handleGoogleCallback = async (req, res) => {
  const { code, error } = req.query;
  try {
    if (code) {
      const data = await getTokensFromCode(code);
      const user = await getUserFromEmails([data.profile.email])
        .then(user0 => user0.toJSON())
        .catch(err => {
          logger.error(err);
          res.status(401);
          res.json({
            error: 'Unable to find the user with the given email',
          });
        });
      if (user) {
        const { profile } = data;
        const googleToken = data.tokens.access_token;
        const expiry = data.expiry_date;
        profile.tokens = data.tokens;
        try {
          const dataSC = await addGoogleProfile({
            profile,
            googleToken,
            expiry,
            user,
          });
          // console.log(dataSC.user);
          // Create calendar events if user is learner
          if (user.role === USER_ROLES.LEARNER) {
            try {
              await createCalendarEventsForLearner(user.id);
            } catch (err) {
              logger.error(err);
            }

            // logger.info(calendarStats);
            res.json({
              text: 'Breakout are successfully added to Google Calendar',
              data: dataSC.user,
            });
          } else {
            logger.info(`Calendar events not created for ${user.id}`);
            res.json({
              text: 'Google authentication successfull',
              data: dataSC.user,
            });
          }
        } catch (err) {
          logger.error(`Failed to authenticate google for user_id: ${user.id}`);
          logger.error(err);
          res.status(403);
          res.json({
            error: 'Failed to authenticate Google',
          });
        }
      }
    } else {
      logger.error(error);
      res.status(403);
      res.json({
        error: 'Failed to authenticate Google',
      });
    }
  } catch (err) {
    logger.error('check REDIRECT_URLS for google app');
    logger.error(err);
    res.status(403);
    res.json({
      error: 'Failed to authenticate Google',
    });
  }
};
