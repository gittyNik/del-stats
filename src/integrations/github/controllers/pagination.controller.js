import queryString from 'query-string';
import { Octokit } from '@octokit/rest';
import { org } from './git.auth.controller';
import { getAccessTokenPerUser } from './stats.controller';
import logger from '../../../util/logger';

const relInLinks = link => {
  let linkRegex = /\<([^>]+)/g;
  let relRegex = /rel="([^"]+)/g;
  let linkArray = [];
  let relArray = [];
  let finalResult = {};
  let temp;
  while ((temp = linkRegex.exec(link)) != null) {
    linkArray.push(temp[1]);
  }
  while ((temp = relRegex.exec(link)) != null) {
    relArray.push(temp[1]);
  }

  finalResult = relArray.reduce((object, value, index) => {
    object[value] = linkArray[index];
    return object;
  }, {});
  return queryString.parse(
    finalResult.last.substring(finalResult.last.indexOf('?')),
  ).page;
};

// TODO: Incorrect use of pagination
// Replace with https://octokit.github.io/rest.js/v18#pagination
export const getNumberOfPages = async (of, team = null, socialConnection,
  since = '2020-01-01T00:00:00Z',
) => {
  if (since === null) {
    since = '2020-01-01T00:00:00Z';
  }
  // let access_token = getAccessTokenPerUser(socialConnection);
  let access_token = process.env.GITHUB_ACCESS_TOKEN;
  let newOctokit = new Octokit({
    auth: access_token,
  });

  try {
    if (of === 'repoCollaborators') {
      return newOctokit.repos
        .listCollaborators({
          owner: org,
          repo: team,
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    } if (of === 'authoredCommits') {
      return newOctokit.repos
        .listCommits({
          owner: org,
          repo: team.repository_name,
          author: team.author,
          per_page: 100,
          page: 1,
          since,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    } if (of === 'allCommits') {
      return newOctokit.repos
        .listCommits({
          owner: org,
          repo: team,
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        })).catch(err => 0);
    } if (of === 'teams') {
      return newOctokit.teams
        .list({
          org,
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    } if (of === 'repos') {
      return newOctokit.repos
        .listForOrg({
          org,
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    } if (of === 'teamMembers') {
      return newOctokit.teams
        .listMembersInOrg({
          org,
          team_slug: team,
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    } if (of === 'orgs') {
      return newOctokit.orgs
        .listMembers({
          org,
          role: 'all',
          per_page: 100,
          page: 1,
        })
        .then(data => ({
          pages: 'link' in data.headers
            ? relInLinks(data.headers.link)
            : 1,
        }));
    }
  } catch (err) {
    logger.error(err);
  }
};

export default getNumberOfPages;
