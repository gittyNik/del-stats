import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import {
	getAllRepos,
	createGithubRepositoryFromTemplate
} from "./repository.controller.js";
import { getRecentCommitByUser } from "./commits.controller.js";
import {getTeamsbyCohortMilestoneId} from "../../../models/team";


// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
	const { username, repo_name } = req.params;
	getRecentCommitByUser(username, repo_name)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

const getRecentCommitInCohort = async cohort_milestone_id => {
	let teams = await getTeamsbyCohortMilestoneId
}

export {
	createTeam,
	getTeamIdByName,
	sendInvitesToNewMembers,
	isEducator,
	getAllRepos,
	createGithubRepositoryFromTemplate,
	getRecentCommit,
	getRecentCommitInCohort
};
