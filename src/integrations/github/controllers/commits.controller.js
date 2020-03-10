import { octokit, org } from "./git.auth.controller.js";
import { getNumberOfPages } from "./pagination.controller.js";
// Receives github username, repository name from front-end

export const getRecentCommitByUser = (username, repository_name) =>
	octokit.repos
		.listCommits({
			owner: org,
			repo: repository_name,
			author: username
		})
		.then(commits => commits.data)
		.then(commits => (commits.length > 0 ? commits[0] : {}));

export const getRecentCommitInRepository = repository_name =>
	octokit.repos
		.listCommits({
			owner: org,
			repo: repository_name
		})
		.then(commits => commits.data)
		.then(commits => (commits.length > 0 ? commits[0] : {}));

export const getAllCommitsPageWise = (
	repository_name,
	per_page = 100,
	page = 1
) =>
	octokit.repos
		.listCommits({
			owner: org,
			repo: repository_name,
			per_page,
			page
		})
		.then(data => data.data);

export const getAllCommits = async repository_name =>
	await getNumberOfPages("allCommits", repository_name).then(
		async ({ pages }) => {
			let commits = [];
			for (let i = 1; i <= pages; i++) {
				let mems = await getAllCommitsPageWise(repository_name, 100, i);
				mems.map(mem => commits.push(mem));
			}
			return commits;
		}
	);

export const getAllAuthoredCommitsPageWise = (
	repository_name,
	author,
	per_page = 100,
	page = 1
) =>
	octokit.repos
		.listCommits({
			owner: org,
			repo: repository_name,
			author,
			per_page,
			page
		})
		.then(data => data.data);

export const getAllAuthoredCommits = async (repository_name, author) =>
	await getNumberOfPages("authoredCommits", { repository_name, author }).then(
		async ({ pages }) => {
			let commits = [];
			for (let i = 1; i <= pages; i++) {
				let mems = await getAllAuthoredCommitsPageWise(
					repository_name,
					author,
					100,
					i
				);
				mems.map(mem => commits.push(mem));
			}
			return commits;
		}
	);

export const getCommitsBetweenDates = async (repo, since, until) =>
	octokit.repos
		.listCommits({
			owner: org,
			repo,
			since,
			until
		})
		.then(data => data.data);

export const getAuthoredCommitsBetweenDates = async (
	repo,
	since,
	until,
	author
) =>
	octokit.repos
		.listCommits({
			owner: org,
			repo: repo,
			since,
			until,
			author
		})
		.then(data => data.data);
