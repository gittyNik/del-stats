import { octokit, org } from "./git.auth.controller.js";
import { getGithubIdfromUsername } from "./users.controller.js";
import { isMember } from "./orgs.controller.js";
import { getNumberOfPages } from "./pagination.controller.js";
import _ from "lodash";

// Create cohort github team if not present
// Links parent team if parent_team_id is present
export const createTeam = (
	name,
	program_id,
	location,
	start_date,
	parent_team_id = null
) => {
	const teamName = `${name}_${toSentenceCase(
		program_id
	)}_${location}_${new Date(start_date).getFullYear()}`;
	return teamPresentOrNot(teamName)
		.then(present =>
			present ? {} : createGitHubTeam(teamName, parent_team_id)
		)
		.then(() => teamName);
};

// Adds new member to team, has to be organisation
// assigns role = "member" by default
export const addMemberToTeam = (name, githubUsername, role = "member") => {
	octokit.teams.addOrUpdateMembershipInOrg({
		org,
		team_slug: name,
		username: githubUsername,
		role
	});
};

// Get all teams present in organisation `org`
const getAllTeams = async () =>
	await getNumberOfPages("teams").then(async ({ pages }) => {
		let teams = [];
		for (let i = 1; i <= pages; i++) {
			let mems = await getAllTeamsPageWise(100, i);
			mems.map(mem => teams.push(mem));
		}
		return teams;
	});

// Gets all Team members
const getAllTeamMembers = async team =>
	await getNumberOfPages("teamMembers", team).then(async ({ pages }) => {
		let members = [];
		for (let i = 1; i <= pages; i++) {
			let mems = await getAllTeamMembersPageWise(team, 100, i);
			mems.map(mem => members.push(mem));
		}
		return members;
	});

// Checks if Team is present in organisation `org` or not
const teamPresentOrNot = async name =>
	await getAllTeams()
		.then(teams => _.filter(teams, team => team.name === name))
		.then(team => (team.length > 0 ? true : false));

// Checks if a github user is part of team or not
export const isTeamMember = async (team, login) =>
	getAllTeamMembers(team)
		.then(members => _.filter(members, member => member.login === login))
		.then(member => (member.length > 0 ? true : false));

// Gets team id by name
export const getTeamIdByName = name =>
	octokit.teams
		.getByName({
			org,
			team_slug: name
		})
		.then(data => data.data)
		.then(data => data.id);

// Check is the github user is part of educator team or not
export const isEducator = async (login, team = "Educators") =>
	getAllTeamMembers(team)
		.then(members => _.filter(members, member => member.login === login))
		.then(member => (member.length > 0 ? true : false));

//*******************//
// Utility functions //
//*******************//

const createGitHubTeam = (name, parent_team_id = null, privacy = "closed") =>
	octokit.teams.create({
		org,
		name,
		parent_team_id,
		privacy
	});

const getAllTeamsPageWise = (per_page = 100, page = 1) =>
	octokit.teams
		.list({
			org,
			per_page,
			page
		})
		.then(teams => teams.data);

const getAllTeamMembersPageWise = (team, per_page = 100, page = 1) =>
	octokit.teams
		.listMembersInOrg({
			org,
			team_slug: team,
			per_page,
			page
		})
		.then(members => members.data);

export const toSentenceCase = str =>
	`${str.charAt(0).toUpperCase()}${str.substring(1).toLowerCase()}`;

