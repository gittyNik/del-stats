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
	getRecentCommitInRepository,
	getCommitsBetweenDates,
	getAuthoredCommitsBetweenDates
} from "./commits.controller.js";
import {
	getTeamsbyCohortMilestoneId,
	createMilestoneTeams,
	getLearnerTeamOfMilestone,
	getAllLearnerTeamsByUserId
} from "../../../models/team";
import { getGithubConnecionByUserId } from "../../../models/social_connection";
import {
	learnerChallengesFindOrCreate,
	getChallengesByUserId,
	latestChallengeInCohort
} from "../../../models/learner_challenge";
import {
	contributersInRepository,
	weeklyCommitActivityData
} from "./stats.controller.js";
import { getCohortMilestonesByCohortId } from "../../../models/cohort_milestone";
import _ from "lodash";

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
	const { username, repo_name } = req.params;
	getRecentCommitByUser(username, repo_name)
		.then(data => res.send({ data }))
		.catch(err => res.status(500).send(err));
};

const getLatestCommitInCohort = async cohort_milestone_id => {
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
};

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

const getTotalTeamAndUserCommitsCount = async (
	user_id,
	milestone_repo_name
) => {
	const socialConnection = await getGithubConnecionByUserId(user_id);
	const teamCommits = await getAllCommits(milestone_repo_name);
	const userCommits = await getAllAuthoredCommits(
		milestone_repo_name,
		socialConnection.username
	);
	return {
		teamCommits: teamCommits.length,
		userCommits: userCommits.length
	};
};

const getTotalTeamAndUserCommits = async (req, res) => {
	try {
		const { milestone_repo_name } = req.params;
		const user_id = req.jwtData.user.id;
		const count = await getTotalTeamAndUserCommitsCount(
			user_id,
			milestone_repo_name
		);
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
	contributersInRepository(milestone_repo_name)
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

const numberOfLinesInEachMilestone = async (cohort_id, user_id, username) => {
	try {
		let teams = await getAllLearnerTeamsByUserId(user_id);

		for (let i = 0; i < teams.length; i++) {
			let cont = await contributersInRepository(
				teams[i].github_repo_link
			);
			teams[i] = { team: teams[i], cont };
			for (let j = 0; j < teams[i].cont.length; j++) {
				if (teams[i].cont[j].author.login === username) {
					teams[i].cont = teams[i].cont[j];
					break;
				}
			}
		}
		for (let i = 0; i < teams.length; i++) {
			let a = 0,
				d = 0;
			for (let j = 0; j < teams[i].cont.weeks.length; j++) {
				a += teams[i].cont.weeks[j].a;
				d += teams[i].cont.weeks[j].d;
			}
			teams[i] = {
				noOfLines: a - d,
				cohort_milestone_id: teams[i].team.cohort_milestone_id
			};
		}
		res.send({ data: teams });
	} catch (err) {
		res.status(500).send(err);
	}
};

const isoToDateString = str => {
	str = new Date(str);
	return `${str.getDate()}/${str.getMonth() + 1}/${str.getUTCFullYear()}`;
};

const commitsDayWise = (date, commits) => {
	let first = true;
	let day = 24 * 60 * 60 * 1000;
	let dayWiseCommits = [];
	let index = 0;
	while (commits.length > 0) {
		if (first) {
			let commit = commits[0];
			dayWiseCommits[index] = {
				day: isoToDateString(commit.commit.committer.date),
				commits: 1
			};
			commits.pop();
			first = false;
			continue;
		}
		let commit = commits[0];
		if (
			isoToDateString(commit.commit.committer.date) !==
			dayWiseCommits[index].day
		) {
			index++;
		}
		dayWiseCommits[index] = {
			day: isoToDateString(commit.commit.committer.date),
			commits:
				dayWiseCommits[index] === undefined
					? 1
					: dayWiseCommits[index].commits + 1
		};
		commits.pop();
	}
	let final = [];
	for (let i = 0; i < 14; i++) {
		let d = date + day * i;
		d = isoToDateString(new Date(d).toISOString());
		let temp = _.filter(dayWiseCommits, el => el.day === d);
		if (temp.length === 0) {
			temp = { day: d, commits: 0 };
		} else {
			temp = temp[0];
		}
		final.push(temp);
	}
	return final;
};

const userAndTeamCommitsDayWise = async (learners, repo) => {
	let ret = [];
	let now = Date.now();
	let twoWeeks = 13 * 24 * 60 * 60 * 1000;
	twoWeeks = now - twoWeeks;
	let commits = await getCommitsBetweenDates(
		repo,
		new Date(twoWeeks).toISOString(),
		new Date(Date.now()).toISOString()
	);
	for (let i = 0; i < learners.length; i++) {
		let user = learners[i];
		console.log(`4444444444`, user);
		let socialConnection = await getGithubConnecionByUserId(user.id);
		if (socialConnection === null) {
			ret.push({
				user_id: user.id,
				gitUsername: null,
				userCommitsDayWise: 0,
				teamCommitsDayWise: 0
			});
		} else {
			let authorCommits = await getAuthoredCommitsBetweenDates(
				repo,
				new Date(twoWeeks).toISOString(),
				new Date(Date.now()).toISOString(),
				socialConnection.username
			);
			ret.push({
				user_id: user.id,
				gitUsername: socialConnection.username,
				userCommitsDayWise: commitsDayWise(twoWeeks, authorCommits),
				teamCommitsDayWise: commitsDayWise(twoWeeks, commits)
			});
		}
	}
	return ret;
};

const allStats = async (req, res) => {
	try {
		const { cohort_id, cohort_milestone_id } = req.params;
		const user_id = req.jwtData.user.id;
		let socialConnection = await getGithubConnecionByUserId(user_id);
		if (socialConnection !== null) {
			let a = await numberOfLinesInEachMilestone(
				cohort_id,
				user_id,
				socialConnection.username
			);

			let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
			for (let i = 0; i < teams.length; i++) {
				let commits = await getAllCommits(teams[i].github_repo_link);
				teams[i] = { team: teams[i], commits };
			}
			let LatestChallengeInCohort = await latestChallengeInCohort(
				cohort_id
			);
			const latestCommitInCohort = await getLatestCommitInCohort(
				cohort_milestone_id
			);
			res.send({
				data: {
					teams: a.teams,
					commitsTeams: teams,
					LatestChallengeInCohort,
					latestCommitInCohort
				}
			});
		} else {
			res.send({
				data: {
					teams: 0,
					commitsTeams: 0,
					LatestChallengeInCohort: 0,
					latestCommitInCohort: 0
				}
			});
		}
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
	getTotalTeamAndUserCommitsCount,
	numberOfLinesInEachMilestone,
	weeklyCommitActivityData,
	userAndTeamCommitsDayWise,
	allStats
};
