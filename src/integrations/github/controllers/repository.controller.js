import request from 'superagent';
import _ from 'lodash';
import { octokit, org } from './git.auth.controller';
import { contributersInRepository } from './stats.controller';
import { getNumberOfPages } from './pagination.controller';

const getAllReposPageWise = (per_page = 100, page = 1) => octokit.repos
  .listForOrg({
    org,
    per_page,
    page,
  })
  .then((repos) => repos.data);

export const getAllRepos = async () => getNumberOfPages('repos')
  .then(async ({ pages }) => {
    let repos = [];
    for (let i = 1; i <= pages; i++) {
      let mems = await getAllReposPageWise(100, i);
      mems.map((mem) => repos.push(mem));
    }
    return repos;
  });

const getAllRepositoryCollaboratorsPageWise = (
  repo,
  per_page = 100,
  page = 1,
) => octokit.repos
  .listCollaborators({
    owner: org,
    repo,
    per_page,
    page,
  })
  .then((collaboraters) => collaboraters.data);

const getAllRepositoryCollaborators = async (repo) => getNumberOfPages(
  'repoCollaborators', repo,
).then(
  async ({ pages }) => {
    let collaboraters = [];
    for (let i = 1; i <= pages; i++) {
      let mems = await getAllRepositoryCollaboratorsPageWise(
        repo,
        100,
        i,
      );
      mems.map((mem) => collaboraters.push(mem));
    }
    return collaboraters;
  },
);

// const isRepositoryCollaboratorOrNot = async (repo, collaborater) =>
// 	octokit.repos.checkCollaborator({
// 		owner,
// 		repo,
// 		username
// 	});

export const createGithubRepository = (repo) => octokit.repos.createInOrg({
  org,
  name: repo,
  license_template: 'mit',
  private: true,
});

export const deleteGithubRepository = (repo) => octokit.repos.delete({
  owner: org,
  repo,
});

export const createGithubRepositoryFromTemplate = async (
  template_repo_name,
  repo,
  description = '',
) => {
  const params = {
    owner: org,
    name: repo,
    description,
    private: true,
  };
  return request
    .post(
      `https://api.github.com/repos/${org}/${template_repo_name}/generate`,
    )
    .send(params)
    .set('accept', 'application/vnd.github.baptiste-preview+json')
    .set('authorization', `token ${process.env.GITHUB_ACCESS_TOKEN}`)
    .then((data) => JSON.parse(data.text));
};

export const isExistingRepository = async (name) => {
  let tempSocialConnection = {
    access_token:
      `access_token=${process.env.GITHUB_ACCESS_TOKEN}&`,
  };
  let existingRepo = await contributersInRepository(name, tempSocialConnection);

  if (_.isEmpty(existingRepo)) {
    return false;
  }
  return true;
};

export const repositoryPresentOrNot = (name) => getAllRepos()
  .then((repos) => _.filter(repos, (repo) => repo.name === name))
  .then((repo) => (repo.length > 0));

export const isRepositoryCollaborator = async (login, repo) => getAllRepositoryCollaborators(repo)
  .then((collaboraters) => _.filter(
    collaboraters,
    (collaborater) => collaborater.login === login,
  ))
  .then((collaborater) => (collaborater.length > 0));

export const addCollaboratorToRepository = async (
  collaborater, repo, permission = 'push') => octokit.repos.addCollaborator({
  owner: org,
  repo,
  username: collaborater,
  permission,
});

export const addTeamAccessToRepo = async (
  team_slug,
  repo,
  permission = 'pull',
) => octokit.teams.addOrUpdateRepoInOrg({
  org,
  team_slug,
  owner: org,
  repo,
  permission,
});

export const createRepositoryifnotPresentFromTemplate = async (
  template_repo_name,
  repo,
) => {
  // Create repository for Challenge

  let isPresent = await isExistingRepository(repo);

  if (!isPresent) {
    return createGithubRepositoryFromTemplate(template_repo_name, repo);
  }
  return {};
};

export const provideAccessToRepoIfNot = async (collaborater, repo_name) => {
  // Provide Access to learner

  let isCollaborator = await isRepositoryCollaborator(
    collaborater,
    repo_name,
  );

  if (!isCollaborator) {
    return addCollaboratorToRepository(collaborater, repo_name);
  }
  return {};
};
