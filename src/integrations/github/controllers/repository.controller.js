import request from "superagent";
import { octokit, org } from "./git.auth.controller.js";
import { getNumberOfPages } from "./pagination.controller.js";
import _ from "lodash";

const getAllReposPageWise = (per_page = 100, page = 1) =>
	octokit.repos
		.listForOrg({
			org,
			per_page,
			page
		})
		.then(repos => repos.data);

export const getAllRepos = async () =>
	await getNumberOfPages("repos").then(async ({ pages }) => {
		let repos = [];
		for (let i = 1; i <= pages; i++) {
			let mems = await getAllReposPageWise(100, i);
			mems.map(mem => repos.push(mem));
		}
		return repos;
	});

const getAllRepositoryCollaboratorsPageWise = (
	repo,
	per_page = 100,
	page = 1
) =>
	octokit.repos
		.listCollaborators({
			owner: org,
			repo,
			per_page,
			page
		})
		.then(collaboraters => collaboraters.data);

const getAllRepositoryCollaborators = async repo =>
	await getNumberOfPages("repoCollaborators", repo).then(
		async ({ pages }) => {
			let collaboraters = [];
			for (let i = 1; i <= pages; i++) {
				let mems = await getAllRepositoryCollaboratorsPageWise(
					repo,
					100,
					i
				);
				mems.map(mem => collaboraters.push(mem));
			}
			return collaboraters;
		}
	);

// const isRepositoryCollaboratorOrNot = async (repo, collaborater) =>
// 	octokit.repos.checkCollaborator({
// 		owner,
// 		repo,
// 		username
// 	});

export const createGithubRepository = repo =>
	octokit.repos.createInOrg({
		org,
		name
	});

export const createGithubRepositoryFromTemplate = async (
	template_repo_name,
	repo,
	description = ""
) => {
	const params = {
		owner: org,
		name: repo,
		description
	};
	return request
		.post(
			`https://api.github.com/repos/${org}/${template_repo_name}/generate`
		)
		.send(params)
		.set("accept", "application/vnd.github.baptiste-preview+json")
		.set("authorization", `token ${process.env.GITHUB_ACCESS_TOKEN}`)
		.then(data => data);
};

export const repositoryPresentOrNot = async name =>
	await getAllRepos()
		.then(repos => _.filter(repos, repo => repo.name === name))
		.then(repo => (repo.length > 0 ? true : false));

export const isRepositoryCollaborator = async (login, repo) =>
	getAllRepositoryCollaborators(repo)
		.then(collaboraters =>
			_.filter(
				collaboraters,
				collaborater => collaborater.login === login
			)
		)
		.then(collaborater => (collaborater.length > 0 ? true : false));

export const addCollaboratorToRepository = async (collaborater, repo) =>
	octokit.repos.addCollaborator({
		owner: org,
		repo,
		username: collaborater
	});

export const createRepositoryifnotPresentFromTemplate = async (
	template_repo_name,
	repo
) => {
	// Create repository for Challenge

	let isPresent = await repositoryPresentOrNot(repo);

	if (!isPresent) {
		return createGithubRepositoryFromTemplate(template_repo_name, repo);
	} else {
		return {};
	}
};

export const provideAccessToRepoIfNot = async (collaborater, repo_name) => {
	// Provide Access to learner

	let isCollaborator = await isRepositoryCollaborator(
		collaborater,
		repo_name
	);

	if (!isCollaborator) {
		return addCollaboratorToRepository(collaborater, repo_name);
	} else {
		return {};
	}
};
