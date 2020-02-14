import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import {
	getAllRepos,
	createGithubRepositoryFromTemplate
} from "./repository.controller.js";
import { getRecentCommitByUser } from "./commits.controller.js";


// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
	const { username, repo_name } = req.params;
	getRecentCommitByUser(username, repo_name)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

export {
	createTeam,
	getTeamIdByName,
	sendInvitesToNewMembers,
	isEducator,
	getAllRepos,
	createGithubRepositoryFromTemplate,
	getRecentCommit
};
