import { octokit, org } from "./git.auth.controller.js";

// Receives github username, repository name from front-end

export const getRecentCommitByUser = (username, repository_name) =>
	octokit.repos.listCommits({
		owner: org,
		repo: repository_name,
		author: username
	})
	.then(commits => commits.data)
	.then(commits => commits.length>0? commits[0]: {});
