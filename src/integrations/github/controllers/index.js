import request from "superagent";
import { octokit, org } from "./git.auth.controller.js";
import {
	createTeam,
	getTeamIdByName,
	isEducator,
	toSentenceCase
} from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import {
	getAllRepos,
	createGithubRepositoryFromTemplate,
	addCollaboratorToRepository,
	repositoryPresentOrNot,
	isRepositoryCollaborator,
	createGithubRepository,
	createRepositoryifnotPresentFromTemplate,
	provideAccessToRepoIfNot
} from "./repository.controller.js";
import {
	getAllAuthoredCommits,
	getAllCommits,
	getRecentCommitByUser,
	getRecentCommitInRepository
} from "./commits.controller.js";
import {
	getTeamsbyCohortMilestoneId,
	createMilestoneTeams
} from "../../../models/team";
import { getGithubConnecionByUserId } from "../../../models/social_connection";
import {
	learnerChallengesFindOrCreate,
	getChallengesByUserId
} from "../../../models/learner_challenge";

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
	const { username, repo_name } = req.params;
	getRecentCommitByUser(username, repo_name)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

const getLatestCommitInCohort = async (cohort_milestone_id) => {
	let commits = [];
	let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
	teams = teams.map(team => team.github_repo_link);
	for (let i = 0; i < teams.length; i++) {
		let commit = await getRecentCommitInRepository(teams[i]);
		if (!commit.hasOwnProperty("sha")) {
			continue;
		}
		commits.push(commit);
	}
	let latestCommit;
	if (commits.length === 0) {
		latestCommit = {};
	} else if (commits.length === 1) {
		latestCommit = commits[0];
	} else {
		latestCommit = commits[0];
		let latestDate = new Date(latestCommit.commit.committer.date);
		for (let i = 1; i < commits.length; i++) {
			let iDate = new Date(commits[i].commit.committer.date);
			if (iDate > latestDate) {
				latestCommit = commits[i];
				latestDate = iDate;
			}
		}
	}
	return latestCommit;
}

// Returns latest commit in entire cohort for that milestone
const getRecentCommitInCohort = async (req, res) => {
	try {
		const { cohort_milestone_id } = req.params;
		const latestCommit = await getLatestCommitInCohort(cohort_milestone_id);
		res.send({ data: latestCommit });
	} catch (err) {
		res.status(500).send(err);
	}
};

const createChallenge = async (req, res) => {
	try {
		const { id } = req.params;
		const user_id = req.jwtData.user.id;
		learnerChallengesFindOrCreate(id, user_id)
			.then(data => res.send({ data }))
			.catch(err => res.status(500).send(err));
	} catch (err) {
		res.status(500).send(err);
	}
};

const getTotalTeamAndUserCommitsCount = async (user_id, milestone_repo_name) => {
	const socialConnection = await getGithubConnecionByUserId(user_id);
	const teamCommits = await getAllCommits(milestone_repo_name);
	const userCommits = await getAllAuthoredCommits(
		milestone_repo_name,
		socialConnection.username
	);
	return {
		teamCommits: teamCommits.length,
		userCommits: userCommits.length
	}
}

const getTotalTeamAndUserCommits = async (req, res) => {
	try {
		const { milestone_repo_name } = req.params;
		const user_id = req.jwtData.user.id;
		const count = await getTotalTeamAndUserCommitsCount(user_id, milestone_repo_name);
		res.send({
			data: count
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
			res.send({ data: { numberOfCommits: commits } });
		})
		.catch(err => res.status(500).send(err));
};

const createMilestoneTeamsbyCohortMilestoneId = async (req, res) => {
	const { cohort_milestone_id } = req.params;
	createMilestoneTeams(cohort_milestone_id)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

const numberOfAttemptedChallenges = async (req, res) => {
	const user_id = req.jwtData.user.id;
	getChallengesByUserId(user_id)
		.then(challenges =>
			res.send({ data: { noOfChallenges: challenges.length } })
		)
		.catch(err => res.status(500).send(err));
};

const getTotalCohortCommits = async (req, res) => {
	try {
		const { cohort_milestone_id } = req.params;
		let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
		let commits = 0;
		for (let i = 0; i < teams.length; i++) {
			let commit = await getAllCommits(teams[i].github_repo_link); //needs to be repo name not links
			commits = commits + commit;
		}
		res.send({ data: { totalCommits: commits } });
	} catch (err) {
		res.status(500).send(err);
	}
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
	getTotalTeamAndUserCommits,
	toSentenceCase,
	createGithubRepository,
	createRepositoryifnotPresentFromTemplate,
	provideAccessToRepoIfNot,
	createMilestoneTeamsbyCohortMilestoneId,
	numberOfAttemptedChallenges,
	getTotalCohortCommits,
	getLatestCommitInCohort,
	getTotalTeamAndUserCommitsCount
};
