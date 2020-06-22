import request from 'superagent';
// import { octokit, org } from './git.auth.controller';

export const getGithubIdfromUsername = username => request
  .get(`https://api.github.com/users/${username}`)
  .set('accept', 'application/vnd.github.baptiste-preview+json')
  .set('authorization', `token ${process.env.GITHUB_ACCESS_TOKEN}`)
  .then(data => data.body)
  .then(data => `${data.id}`);

export default getGithubIdfromUsername;
