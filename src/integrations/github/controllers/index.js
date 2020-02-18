import request from "superagent";
import { octokit, org } from "./git.auth.controller.js";
import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import {
	getAllRepos,
	createGithubRepositoryFromTemplate,
	addCollaboratorToRepository,
	repositoryPresentOrNot,
	isRepositoryCollaborator,
	getAllAuthoredCommits,
	getAllCommits
} from "./repository.controller.js";
import {
	getRecentCommitByUser,
	getRecentCommitInRepository
} from "./commits.controller.js";
import { getTeamsbyCohortMilestoneId } from "../../../models/team";
import { getGithubConnecionByUserId } from "../../../models/social_connection";
import { learnerChallengesFindOrCreate } from "../../../models/learner_challenge";

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
	const { username, repo_name } = req.params;
	getRecentCommitByUser(username, repo_name)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

// Returns latest commit in entire cohort for that milestone
const getRecentCommitInCohort = async (req, res) => {
	try {
		const { cohort_milestone_id } = req.params;
		let commits = [];
		let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
		teams.map(team => team.github_repo_link);
		for (let i = 0; i < teams.length; i++) {
			let commit = await getRecentCommitInRepository(team[i]);
			if (!commit.hasOwnProperty("sha")) {
				continue;
			}
			commits.push(commit);
		}
		if (commits.length === 0) {
			res.send({ data: {} });
		} else if (commits.length === 1) {
			res.send({ data: commits[0] });
		} else {
			let latestCommit = commits[0];
			for (let i = 1; i < commits.length; i++) {
				let latestDate = new Date(latestCommit.committer.date);
				let iDate = new Date(commit[i].committer.date);
				if (idate > latestDate) {
					latestCommit = commit[i];
				}
			}
			res.send({ data: latestCommit });
		}
	} catch (err) {
		res.status(500).send(err);
	}
};

const createChallenge = async (req, res) => {
	try {
		const { challenge_id } = req.body;
		const user_id = req.jwtData.user.id;
		learnerChallengesFindOrCreate(challenge_id, user_id)
			.then(data => res.send({ data }))
			.catch(err => res.status(500).send(err));
	} catch (err) {
		res.status(500).send(err);
	}
};

const getTotalTeamAndUserCommits = async (req, res) => {
	try {
		const { milestone_repo_name } = req.params;
		const user_id = req.jwtData.user.id;
		let socialConnection = await getGithubConnecionByUserId(user_id);
		let teamCommits = await getAllCommits(milestone_repo_name);
		let userCommits = await getAllAuthoredCommits(
			milestone_repo_name,
			socialConnection.username
		);
		res.send({
			data: {
				userCommits: userCommits.length,
				teamCommits: teamCommits.length
			}
		});
	} catch (err) {
		res.status(500).send(err);
	}
};

const getTotalUserCommitsPastWeek = async (req, res) => {
	const { milestone_repo_name } = req.params;
	const user_id = req.jwtData.user.id;
	request
		.get(
			`https://api.github.com/repos/${org}/${milestone_repo_name}/stats/contributors`
		)
		.set("accept", "application/vnd.github.baptiste-preview+json")
		.set("authorization", `token ${process.env.GITHUB_ACCESS_TOKEN}`)
		.then(data => JSON.parse(data.text))
		.then(async data => {
			let socialConnection = await getGithubConnecionByUserId(user_id);
			let commits = 0;
			data.map(dt => {
				if (dt.author.login === socialConnection.username) {
					commits = dt.weeks[0].c;
				}
			});
			res.send({ data: commits });
		})
		.catch(err => res.status(500).send(err));
};

export {
	createTeam,
	getTeamIdByName,
	sendInvitesToNewMembers,
	isEducator,
	getAllRepos,
	createGithubRepositoryFromTemplate,
	getRecentCommit,
	getRecentCommitInCohort,
	createChallenge,
	addCollaboratorToRepository,
	repositoryPresentOrNot,
	isRepositoryCollaborator,
	getTotalUserCommitsPastWeek,
	getTotalTeamAndUserCommits
};
