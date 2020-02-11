import { octokit } from "./git.auth.controller.js";

const org = process.env.SOAL_LEARNER_ORG;

const getGithubIdfromUsername = username =>
	request
		.get(`https://api.github.com/users/${username}`)
		.then(data => data.body)
		.then(data => `${data.id}`);


export { getGithubIdfromUsername };