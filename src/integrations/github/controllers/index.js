import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";

export {
	createTeam,
	getTeamIdByName,
	sendInvitesToNewMembers,
	isEducator
};