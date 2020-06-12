import _ from 'lodash';
import { octokit, org } from './git.auth.controller';
import {
  isTeamMember,
  addMemberToTeam,
  getTeamIdByName,
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
  let is = await isMember(githubUsername);
  if (is) {
    // check if user is team member
    let isTmember = await isTeamMember(teamName, githubUsername);
    if (!isTmember) {
      // Is org member, add as team member
      return addMemberToTeam(teamName, githubUsername);
    }
    return {};
  }
  // send org invite
  const teamId = await getTeamIdByName(teamName);
  let team_ids = [];
  team_ids.push(teamId);
  return sendGithubInvites(githubEmailId, team_ids);
  // add in queue: JOB: check if invitation is accepted, add in team
  // if invitation is not accepted, sms reminder, set JOB
};
