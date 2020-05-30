import { Octokit } from '@octokit/rest';
import { org } from './git.auth.controller';
import { getNumberOfPages } from './pagination.controller';
import { getAccessTokenPerUser } from './stats.controller';
// Receives github username, repository name from front-end

export const getRecentCommitByUser = async (username, repository_name, socialConnection) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo: repository_name,
      author: username,
    })
    .then(commits => commits.data)
    .then(commits => (commits.length > 0 ? commits[0] : {}));
};

export const getRecentCommitInRepository = async (repository_name, socialConnection) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo: repository_name,
    })
    .then(commits => commits.data)
    .then(commits => (commits.length > 0 ? commits[0] : {}));
};

export const getAllCommitsPageWise = async (
  repository_name,
  per_page = 100,
  page = 1,
  socialConnection,
) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo: repository_name,
      per_page,
      page,
    })
    .then(data => data.data);
};

export const getAllCommits = async (repository_name, socialConnection) => getNumberOfPages(
  'allCommits', repository_name, socialConnection,
).then(
  async ({ pages }) => {
    let commits = [];
    for (let i = 1; i <= pages; i++) {
      let mems = getAllCommitsPageWise(repository_name, 100, i, socialConnection);
      commits.push(mems);
    }
    return Promise.all(commits);
  },
);

export const getAllAuthoredCommitsPageWise = async (
  repository_name,
  author,
  per_page = 100,
  page = 1,
  socialConnection,
) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo: repository_name,
      author,
      per_page,
      page,
    })
    .then(data => data.data);
};

export const getAllAuthoredCommits = async (repository_name,
  author, socialConnection) => getNumberOfPages(
  'authoredCommits', { repository_name, author }, socialConnection,
).then(
  async ({ pages }) => {
    let commits = [];
    for (let i = 1; i <= pages; i++) {
      let mems = getAllAuthoredCommitsPageWise(
        repository_name,
        author,
        100,
        i,
        socialConnection,
      );
      commits.push(mems);
    }
    return Promise.all(commits);
  },
);

export const getCommitsBetweenDates = async (repo, since, until, socialConnection) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo,
      since,
      until,
    })
    .then(data => data.data);
};

export const getAuthoredCommitsBetweenDates = async (
  repo,
  since,
  until,
  socialConnection,
) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos
    .listCommits({
      owner: org,
      repo,
      since,
      until,
      author: socialConnection.author,
    })
    .then(data => data.data);
};
