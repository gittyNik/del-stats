import { google } from 'googleapis';
import dotenv from 'dotenv';
import { getGoogleTokens } from '../models/social_connection';


dotenv.config();
const timeZone = 'Asia/Kolkata';

// parameter -> d is new Date().toISOString()
export const rfc3339 = (d) => {
  function pad(n) {
    return n < 10 ? `0${n}` : n;
  }
  function timezoneOffset(offset) {
    let sign;
    if (offset === 0) {
      return 'Z';
    }
    sign = (offset > 0) ? '-' : '+';
    offset = Math.abs(offset);
    return `${sign + pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;
  }
  let data = [
    `${d.getFullYear()}-`,
    `${pad(d.getMonth() + 1)}-`,
    `${pad(d.getDate())}T`,
    `${pad(d.getHours())}:`,
    `${pad(d.getMinutes())}:`,
    `${pad(d.getSeconds())}`,
    `${timezoneOffset(d.getTimezoneOffset())}`,
  ];
  return data.join('');
};

// google app config
export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URL,
};

// scopes use for the application
const defaultScope = [
  'https://www.googleapis.com/auth/calendar',
  'profile',
  'email',
];

// oauth2 client
function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect,
  );
}

// generate authentication url
function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });
}


// get auth url
export const urlGoogle = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
};

// get oauth2 api
function getOAuth2(auth) {
  return google.oauth2({
    auth,
    version: 'v2',
  });
}

export const getTokensFromCode = async (code) => {
  const oauth2Client = createConnection();
  const data0 = {};
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // console.log('LINE 81');
  // console.log(tokens);
  data0.tokens = tokens;
  const profile = getOAuth2(oauth2Client);
  const googleProfile = await profile.userinfo.v2.me.get();

  // console.log(googleProfile.data);
  data0.profile = googleProfile.data;
  // oauth2Client.on('tokens', (tokens) => {
  //   if (tokens.refresh_token) {
  //     // store the refresh_token in the database!
  //     data.refreshToken = tokens.refresh_token;
  //     console.log(tokens.refresh_token);
  //   }
  //   console.log(tokens.access_token);
  //   data.accessToken = tokens.access_token
  // });
  return data0;
};

// Once the client has a refresh token, access tokens will be
// acquired and refreshed automatically in the next call to the API.
export const getGoogleOauthOfUser = async (user_id) => {
  const tokens = await getGoogleTokens(user_id);
  if (tokens) {
    const oauth2Client = createConnection();
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token,
    });
    return oauth2Client;
  }
  return null;
};

export const convertToEventBody = (summary, start_time, end_time, description, location) => {
  let event_data = {
    summary,
    start: {
      dateTime: rfc3339(new Date(start_time)),
      timeZone,
    },
    end: {
      dateTime: rfc3339(new Date(end_time)),
      timeZone,
    },
    location: location || 'School of Accelerated learning',
    description,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };
  return event_data;
};
