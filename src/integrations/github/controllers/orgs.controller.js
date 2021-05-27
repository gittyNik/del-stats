import _ from 'lodash';
import { octokit, org } from './git.auth.controller';
import {
  isTeamMember,
  addMemberToTeam,
} from './teams.controller';
import { getNumberOfPages } from './pagination.controller';

const getOrgMembersPageWise = (role = 'all', per_page = 100, page = 1) => octokit.orgs
  .listMembers({
    org,
    role,
    per_page,
    page,
  })
  .then(data => data.data);

const getOrgMembers = async () => getNumberOfPages('orgs').then(async ({ pages }) => {
  let members = [];
  let mems = await Promise.all([...Array(pages)].map(page => getOrgMembersPageWise('all', 100, page)));
  mems.map(mem => members.push(mem));
  return members;
});

export const isMember = async login => {
  let members = await getOrgMembers();
  return _.filter(members, member => member.login === login).length > 0;
};

export const isMemberOrg = async username => {
  try {
    const member = await octokit.orgs.getMembership({
      org,
      username,
    });
    return member;
  } catch (err) {
    return null;
  }
};

const sendGithubInvites = (
  githubEmailId,
  team_ids = [],
  role = 'direct_member',
) => octokit.orgs.createInvitation({
  org,
  email: githubEmailId,
  role,
  team_ids,
});

export const sendInvitesToNewMembers = async (
  githubEmailId,
  githubUsername,
  teamName,
) => {
  let isMemberOfOrg = await isMemberOrg(githubUsername);
  if (isMemberOfOrg) {
    let membershipDetails = isMemberOfOrg.data;
    if (('role' in membershipDetails) && (membershipDetails.role === 'member')) {
      // check if user is team member
      let isTmember = await isTeamMember(teamName, githubUsername);
      if (isTmember) {
        if (('role' in isTmember.data) && (isTmember.data.role === 'member') && (isTmember.data.state === 'active')) {
          // Is org member, add as team member
          return {};
        }
      }
      console.log('Added to Team');
      return addMemberToTeam(teamName, githubUsername);
    }
  }
  return {};
  // console.log('Added to Organization');
  // // send org invite
  // const teamId = await getTeamIdByName(teamName);
  // let team_ids = [];
  // team_ids.push(teamId);
  // return sendGithubInvites(githubEmailId, team_ids);
  // add in queue: JOB: check if invitation is accepted, add in team
  // if invitation is not accepted, sms reminder, set JOB
};
