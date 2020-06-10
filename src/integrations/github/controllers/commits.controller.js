import { Octokit } from '@octokit/rest';
import { octokit, org } from './git.auth.controller';
import { getNumberOfPages } from './pagination.controller';
import { getAccessTokenPerUser } from './stats.controller';
// Receives github username, repository name from front-end


export const getRecentCommitByUser = async (username, repository_name, socialConnection) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos.listCommits({
    owner: org,
    repo: repository_name,
    author: username,
  })
    .then(commits => commits.data)
    .then(commits => (commits.length > 0 ? commits[0] : {}));
};

export const getAllCommitsByRepo = async (repository_name, socialConnection) => {
  let access_token = getAccessTokenPerUser(socialConnection);
  let newOctokit = new Octokit({
    auth: access_token,
  });

  return newOctokit.repos.listCommits({
    owner: org,
    repo: repository_name,
  })
    .then(commits => (commits.data.length > 0 ? commits.data : {}));
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
    auth: 'b3c868e1e4ee765672e31fafba73774646d86dd0',
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
    let mems = await Promise.all([...Array(pages)].map(page => getAllCommitsPageWise(
      repository_name, 100,
      page, socialConnection,
    )));
    mems.map(mem => commits.push(mem));
    return commits;
  },
);

export const getAllAuthoredCommitsPageWise = async (
  repository_name,
  author,
  per_page = 100,
  page = 1,
) => {
  let newOctokit = new Octokit({
    auth: 'b3c868e1e4ee765672e31fafba73774646d86dd0',
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

export const getAllAuthoredCommits = async (repository_name, author,
  socialConnection) => getNumberOfPages(
  'authoredCommits', { repository_name, author }, socialConnection,
).then(
  async ({ pages }) => {
    let commits = [];
    let mems = await Promise.all([...Array(pages)].map(page => getAllAuthoredCommitsPageWise(
      repository_name, author, 100,
      page, socialConnection,
    )));
    mems.map(mem => commits.push(mem));
    return commits;
  },
);

export const getCommitsBetweenDates = async (repo, since, until) => octokit.repos
  .listCommits({
    owner: org,
    repo,
    since,
    until,
  })
  .then(data => data.data);

export const getAuthoredCommitsBetweenDates = async (
  repo,
  since,
  until,
  author,
) => octokit.repos
  .listCommits({
    owner: org,
    repo,
    since,
    until,
    author,
  })
  .then(data => data.data);
