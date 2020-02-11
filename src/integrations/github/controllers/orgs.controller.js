import { octokit } from "./git.auth.controller.js";
import { isTeamMember, addMemberToTeam } from "./teams.controller.js";

const org = process.env.SOAL_LEARNER_ORG;

const getOrgMembers = (role = "member") => {
	octokit.orgs.listMembers({
		org
	});
};

export const isMember = async login =>
	await getOrgMembers()
		.then(members => _.filter(members, member => member.login === login))
		.then(member => (member.length > 0 ? true : false));

export const sendInvitesToNewMembers = async (
	githubEmailId,
	githubUsername
) => {
	let is = await isMember(githubUsername);
	if (is) {
		//check if user is team member
		let isTmember = await isTeamMember(githubUsername);
		if (!isTmember) {
			// Is org member, add as team member
			return addMemberToTeam(cohort_name, githubUsername);
		} else {
			return {};
		}
	} else {
		//send org invite
		return sendGithubInvites(githubEmailId);
		//add in queue: JOB: check if invitation is accepted, add in team
		//if invitation is not accepted, sms reminder, set JOB
	}
};

const sendGithubInvites = githubEmailId =>
	octokit.orgs.createInvitation({
		org,
		email: githubEmailId
	});
	
// .then(d => d.data)
// 	.then(d => {
// 		let a = _.filter(d, e => e.login === "Niskarsh");
// 		console.log(d.length)
// 	});
