// const { Octokit } = require("@octokit/rest");
// const request = require("superagent");
// const _ = require("lodash");
// const octokit = new Octokit({
// 	auth: "a88e2f1f88c9bc058050a339aeed22ab690a70fb"
// });
import { octokit } from "./git.auth.controller.js";
import { getGithubIdfromUsername } from "./users.controller.js";
import { isMember } from "./orgs.controller.js";
import _ from "lodash";

const org = process.env.SOAL_LEARNER_ORG;

// Create cohort github team if not present
export const createTeam = (
	name,
	program_id,
	location,
	start_date,
	parent_team_id = null
) => {
	const teamName = `${name}_${toSentenceCase(program_id)}_${location}_${new Date(
		start_date
	).getFullYear()}`;
	return teamPresentOrNot(teamName).then(present =>
		present ? {} : createGitHubTeam(teamName, parent_team_id)
	);
};

const toSentenceCase = str =>
	`${str.charAt(0).toUpperCase()}${str.substring(1).toLowerCase()}`;

export const addMemberToTeam = (
	cohort_name,
	githubUsername,
	role = "member"
) => {
	octokit.teams.addOrUpdateMembershipInOrg({
		org,
		team_slug: cohort_name,
		username: githubUsername,
		role
	});
};

const getAllTeams = () =>
	octokit.teams
		.list({
			org
		})
		.then(teams => teams.data);

const teamPresentOrNot = async name =>
	await getAllTeams()
		.then(teams => _.filter(teams, team => team.name === name))
		.then(team => (team.length > 0 ? true : false));

const createGitHubTeam = (name, parent_team_id = null, privacy = "closed") =>
	octokit.teams.create({
		org,
		name,
		parent_team_id,
		privacy
	});

export const getTeamIdByName = name =>
	octokit.teams
		.getByName({
			org,
			team_slug: name
		})
		.then(data => data.data)
		.then(data => data.id);

// const test = async () => {
// 	let pre = await createGitHubTeam("Delphinus_tep_Hyderabad_2020", 3314015);
// 	console.log(pre);
// };
// test();

const isTeamMember = login => {};

const getMaintainersArrray = async maintainers => {
	let idList = [];
	for (var i = 0; i < maintainers.length; i++) {
		await getGithubIdfromUsername(maintainers[i]).then(id =>
			idList.push(id)
		);
	}
	return idList;
};

// octokit.teams
// 	.getByName({
// 		org: "exponentsoftware",
// 		team_slug: "Learner"
// 	})
// .then(d => console.log(`data`, d))
// .catch(d => console.log(`error`, d));

// test().then(id => console.log(id));

// getMaintainersArrray(["niskarsh"]).then(idList => {
// octokit.teams
// 	.create({
// 		org: "exponentsoftware",
// 		name: "nameissomethingTest",
// 		maintainers: [...idList]
// 	})
// 	.then(d => console.log(`data`, d))
// 	.catch(d => console.log(`error`, d));
// });

// octokit.teams
// 	.create({
// 		org: "exponentsoftware",
// 		name: "nameissomethingTest",
// 		maintainers: ["Niskarsh"]
// 	})
// 	.then(d => console.log(`data`, d))
// 	.catch(d => console.log(`error`, d));
// getTeamIdByName("Learners").then(id => console.log(id));

// octokit.users.getAuthenticated().then(d => console.log(`data`, d))
// 	.catch(d => console.log(`error`, d));
