import request from 'superagent';
import { org } from './git.auth.controller';

export const getAccessTokenPerUser = (socialConnection) => {
  try {
    const { access_token } = socialConnection;
    let accessRegex = /access_token=(\S+?)&/g;

    let user_access_token = accessRegex.exec(access_token);
    if (user_access_token[1] != null) {
      return user_access_token[1];
    }
    throw new Error('Logged in User has no Github access token');
  } catch (err) {
    return null;
  }
};

export const contributersInRepository = async (repo, socialConnection) => {
  let access_token = getAccessTokenPerUser(
    socialConnection,
  );
  return request
    .get(`https://api.github.com/repos/${org}/${repo}/stats/contributors`)
    .set('accept', 'application/vnd.github.baptiste-preview+json')
    .set('authorization', `token ${access_token}`)
    .then(data => JSON.parse(data.text));
};

export const weeklyCommitActivityData = async (repo, socialConnection) => {
  let access_token = getAccessTokenPerUser(
    socialConnection,
  );
  return request
    .get(
      `https://api.github.com/repos/${org}/${repo}/stats/commit_activity`,
    )
    .set('accept', 'application/vnd.github.baptiste-preview+json')
    .set('authorization', `token ${access_token}`)
    .then(data => (data.text === '' ? [] : JSON.parse(data.text)));
};
