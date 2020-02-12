import { octokit } from "./git.auth.controller.js";
import {
	isTeamMember,
	addMemberToTeam,
	getTeamIdByName
} from "./teams.controller.js";
import _ from "lodash";
import queryString from "query-string";

const org = process.env.SOAL_LEARNER_ORG;

const relInLinks = link => {
	var linkRegex = /\<([^>]+)/g;
	var relRegex = /rel="([^"]+)/g;
	var linkArray = [];
	var relArray = [];
	var finalResult = {};
	var temp;
	while ((temp = linkRegex.exec(link)) != null) {
		linkArray.push(temp[1]);
	}
	while ((temp = relRegex.exec(link)) != null) {
		relArray.push(temp[1]);
	}

	finalResult = relArray.reduce((object, value, index) => {
		object[value] = linkArray[index];
		return object;
	}, {});
	return queryString.parse(
		finalResult["last"].substring(finalResult["last"].indexOf("?"))
	).page;
};

const getNumberOfPages = (role = "all", per_page = 100, page = 1) =>
	octokit.orgs
		.listMembers({
			org,
			role,
			per_page,
			page
		})
		.then(data => ({ pages: relInLinks(data.headers.link) }));

const getOrgMembersPageWise = (role = "all", per_page = 100, page = 1) =>
	octokit.orgs
		.listMembers({
			org,
			role,
			per_page,
			page
		})
		.then(data => data.data);

const getOrgMembers = async () =>
	await getNumberOfPages().then(async ({ pages }) => {
		let members = [];
		for (let i = 1; i <= pages; i++) {
			let mems = await getOrgMembersPageWise("all", 100, i);
			mems.map(mem => members.push(mem));
		}
		return members;
	});

export const isMember = async login => {
	let members = await getOrgMembers();
	return _.filter(members, member => member.login === login).length > 0
		? true
		: false;
};

export const sendInvitesToNewMembers = async (
	githubEmailId,
	githubUsername,
	teamName
) => {
	let is = await isMember(githubUsername);
	if (is) {
		//check if user is team member
		let isTmember = await isTeamMember(teamName, githubUsername);
		if (!isTmember) {
			// Is org member, add as team member
			return addMemberToTeam(teamName, githubUsername);
		} else {
			return {};
		}
	} else {
		//send org invite
		const teamId = await getTeamIdByName(teamName);
		let team_ids = [];
		team_ids.push(teamId);
		return sendGithubInvites(githubEmailId, team_ids);
		//add in queue: JOB: check if invitation is accepted, add in team
		//if invitation is not accepted, sms reminder, set JOB
	}
};

const sendGithubInvites = (
	githubEmailId,
	team_ids = [],
	role = "direct_member"
) =>
	octokit.orgs.createInvitation({
		org,
		email: githubEmailId,
		role,
		team_ids
	});

// .then(d => d.data)
// 	.then(d => {
// 		let a = _.filter(d, e => e.login === "Niskarsh");
// 		console.log(d.length)
// 	});
