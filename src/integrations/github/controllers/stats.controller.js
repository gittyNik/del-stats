import request from 'superagent';
import { org } from './git.auth.controller';

export const contributersInRepository = repo => request
  .get(`https://api.github.com/repos/${org}/${repo}/stats/contributors`)
  .set('accept', 'application/vnd.github.baptiste-preview+json')
  .set('authorization', `token ${process.env.GITHUB_ACCESS_TOKEN}`)
  .then(data => JSON.parse(data.text));

export const weeklyCommitActivityData = repo => request
  .get(
    `https://api.github.com/repos/${org}/${repo}/stats/commit_activity`,
  )
  .set('accept', 'application/vnd.github.baptiste-preview+json')
  .set('authorization', `token ${process.env.GITHUB_ACCESS_TOKEN}`)
  .then(data => (data.text === '' ? [] : JSON.parse(data.text)));
