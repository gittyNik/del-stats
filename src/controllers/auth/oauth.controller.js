import request from "superagent";
import uuid from "uuid/v4";
import {
  createTeam,
  getTeamIdByName,
  sendInvitesToNewMembers,
  isEducator
} from "../../integrations/github/controllers";

const getGithubAccessToken = code => {
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code
  };

  return request
    .post("https://github.com/login/oauth/access_token")
    .send(params)
    .then(tokenResponse => ({
      githubToken: tokenResponse.text,
      expiry: tokenResponse.expiry // TODO: need to check if this key is correct
    }));
};

const fetchProfileFromGithub = ({ githubToken, expiry }) =>
  // TODO: reject if expired

  // fetching profile details from github
  request
    .get(`https://api.github.com/user?${githubToken}`)
    .then(profileResponse => {
      const profile = profileResponse.body;
      // fetching all emails from github
      return request
        .get(`https://api.github.com/user/emails?${githubToken}`)
        .then(emailResponse => {
          profile.emails = emailResponse.body.map(o => o.email);
          return { profile, githubToken, expiry };
        });
    });

// fetch profile and add it to social_connections
const addGithubProfile = ({ profile, githubToken, expiry, user }) => {
  const where = {
    user_id: user.id,
    provider: PROVIDERS.GITHUB
  };

  // Insert if the provider is not connected, update if already connected
  return SocialConnection.findOne({ where })
    .then(socialConnection => {
      const updateValues = {
        profile,
        expiry,
        access_token: githubToken,
        updated_at: new Date()
      };

      const newValues = {
        id: uuid(),
        email: user.email,
        username: profile.login,
        created_at: new Date()
      };

      if (socialConnection) {
        return socialConnection.update(updateValues);
      }
      return SocialConnection.create({
        ...where,
        ...newValues,
        ...updateValues
      });
    })
    .then(socialConnection => ({ user, socialConnection }));
};

const wrapParentTeamId = cohort =>
  getTeamIdByName("Learners").then(parent_team_id => ({
    parent_team_id,
    cohort
  }));

const addTeamToExponentSoftware = async userProfile => {
  const isEdu = await isEducator(userProfile.socialConnection.username);
  if (isEdu) {
    return { userProfile, teamName: "Educators" };
  } else {
    return getCohortFromLearnerId(userProfile.user.id)
      .then(wrapParentTeamId)
      .then(({ parent_team_id, cohort }) =>
        createTeam(
          cohort.name,
          cohort.program_id,
          cohort.location === "T-hub, IIIT Hyderabad"
            ? "Hyderabad"
            : cohort.location,
          cohort.start_date,
          parent_team_id
        )
      )
      .then(teamName => ({ userProfile, teamName }));
  }
};

const sendOrgInvites = async ({ userProfile, teamName }) => {
  const isEdu = await isEducator(userProfile.socialConnection.username);
  if (isEdu) {
    return userProfile;
  } else {
    return sendInvitesToNewMembers(
      userProfile.socialConnection.email,
      userProfile.socialConnection.username,
      teamName
    ).then(() => userProfile);
  }
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
          user
        };
      }
      if (user.email === null) {
        // If the user doesn't have email, use email from github
        return {
          profile,
          githubToken,
          expiry,
          user: { ...user, email: profile.emails[0] }
        };
      }
      return Promise.reject("INVALID_EMAIL");
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
        profile
      } = userProfile.socialConnection;
      res.send({
        data: {
          provider,
          username,
          email,
          profile
        }
      });
    })
    .catch(err => {
      if (err.status === 401) {
        res.status(401).send(err.response.text);
      } else if (err === "INVALID_EMAIL") {
        res.status(401).send("Invalid email");
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

  getGithubAccessToken(code)
    .then(fetchProfileFromGithub)
    .then(({ profile, githubToken, expiry }) =>
      // If no user's email is not found with github emails,
      // then authentication error should be sent as resopnse
      getUserFromEmails(profile.emails).then(user => {
        if (user === null || user.role === USER_ROLES.GUEST) {
          return Promise.reject("NO_EMAIL");
        }
        return {
          profile,
          githubToken,
          expiry,
          user
        };
      })
    )
    .then(addGithubProfile)
    .then(addTeamToExponentSoftware)
    .then(sendOrgInvites)
    .then(({ user }) => {
      // {user, socialConnection}
      res.send({
        user,
        soalToken: getSoalToken(user),
        provider: PROVIDERS.GITHUB
      });
    })
    .catch(err => {
      if (err.status === 401) {
        res.status(401).send(err.response.text);
      } else if (err === "NO_EMAIL") {
        // TODO: if the user is not found with emails,
        // save the profile details in session and ask for otp authentication
        res.status(404).send("No user found with email");
      } else {
        res.status(500).send("Authentication Failed");
      }
    });
};