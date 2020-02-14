import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import { getAllRepos, createGithubRepositoryFromTemplate } from "./repository.controller.js";

export {
	createTeam,
	getTeamIdByName,
	sendInvitesToNewMembers,
	isEducator,
	getAllRepos,
	createGithubRepositoryFromTemplate
};