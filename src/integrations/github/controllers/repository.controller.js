import { octokit } from "./git.auth.controller.js";
import _ from "lodash";

const getAllReposPageWise = (per_page = 100, page = 1) =>
	octokit.repos
		.listForOrg({
			org,
			per_page,
			page
		})
		.then(repos => repos.data);

const getAllRepos = async () =>
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
	octokit.repos.listCollaborators({
		owner: org,
		repo,
		per_page,
		page
	});

const getAllRepositoryCollaborators = async repo =>
	await getNumberOfPages("repoCollaborators").then(async ({ pages }) => {
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
	});

const isRepositoryCollaboratorOrNot = async (repo, collaborater) =>
	octokit.repos.checkCollaborator({
		owner,
		repo,
		username
	});

const createGithubRepository = repo =>
	octokit.repos.createInOrg({
		org,
		name
	});

const repositoryPresentOrNot = async repo =>
	await getAllRepos()
		.then(repos => _.filter(repos, repo => repo.name === name))
		.then(repo => (repo.length > 0 ? true : false));

const isRepositoryCollaborator = async (collaborater, repo) =>
	getAllRepositoryCollaborators(repo)
		.then(collaboraters =>
			_.filter(
				collaboraters,
				collaborater => collaborater.login === login
			)
		)
		.then(collaborater => (collaborater.length > 0 ? true : false));
