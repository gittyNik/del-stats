import { createTeam, getTeamIdByName, isEducator } from "./teams.controller.js";
import { sendInvitesToNewMembers } from "./orgs.controller.js";
import {
	getAllRepos,
	createGithubRepositoryFromTemplate
} from "./repository.controller.js";
import {
	getRecentCommitByUser,
	getRecentCommitInRepository
} from "./commits.controller.js";
import { getTeamsbyCohortMilestoneId } from "../../../models/team";

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
