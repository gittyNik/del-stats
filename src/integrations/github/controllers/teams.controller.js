import _ from "lodash";
import { octokit, org } from "./git.auth.controller";
// import { getGithubIdfromUsername } from './users.controller';
// import { isMember } from './orgs.controller';
import { getNumberOfPages } from "./pagination.controller";
import { getGithubConnecionByUserId } from "../../../models/social_connection";
import { getCohortFromId } from "../../../models/cohort";

export const toSentenceCase = (str) =>
  `${str.charAt(0).toUpperCase()}${str.substring(1).toLowerCase()}`;

const teamNameFormat = (cohort_name, program_id, location, start_date) =>
  `${cohort_name}_${toSentenceCase(program_id)}_${location}_${new Date(
    start_date
  ).getFullYear()}`;

export const removeMemberFromTeam = (name, githubUsername) =>
  octokit.teams.removeMembershipInOrg({
    org,
    team_slug: name,
    username: githubUsername,
  });

// Adds new member to team, has to be organisation
// assigns role = "member" by default
export const addMemberToTeam = (name, githubUsername, role = "member") => {
  octokit.teams.addOrUpdateMembershipInOrg({
    org,
    team_slug: name,
    username: githubUsername,
    role,
  });
};

//* ******************//
// Utility functions //
//* ******************//

const getAllTeamMembersPageWise = (team, per_page = 100, page = 1) =>
  octokit.teams
    .listMembersInOrg({
      org,
      team_slug: team,
      per_page,
      page,
    })
    .then((members) => members.data);

// Gets all Team members
const getAllTeamMembers = async (team) =>
  getNumberOfPages("teamMembers", team).then(async ({ pages }) => {
    let members = [];
    for (let i = 1; i <= pages; i++) {
      let mems = await getAllTeamMembersPageWise(team, 100, i);
      mems.map((mem) => members.push(mem));
    }
    return members;
  });

// Checks if a github user is part of team or not
export const isTeamMember = async (team, login) =>
  getAllTeamMembers(team)
    .then((members) => _.filter(members, (member) => member.login === login))
    .then((member) => member.length > 0);

// Gets team id by name
export const getTeamIdByName = (name) =>
  octokit.teams
    .getByName({
      org,
      team_slug: name,
    })
    .then((data) => data.data)
    .then((data) => data.id);

// Check is the github user is part of educator team or not
export const isEducator = async (login, team = "Educators") =>
  getAllTeamMembers(team)
    .then((members) => _.filter(members, (member) => member.login === login))
    .then((member) => member.length > 0);

const createGitHubTeam = (name, parent_team_id = null, privacy = "closed") =>
  octokit.teams.create({
    org,
    name,
    parent_team_id,
    privacy,
  });

// Get all teams present in organisation `org`
const getAllTeams = async () =>
  getNumberOfPages("teams").then(async ({ pages }) => {
    let teams = [];
    for (let i = 1; i <= pages; i++) {
      let mems = await getAllTeamsPageWise(100, i);
      mems.map((mem) => teams.push(mem));
    }
    return teams;
  });

// Checks if Team is present in organisation `org` or not
const teamPresentOrNot = async (name) =>
  getAllTeams()
    .then((teams) => _.filter(teams, (team) => team.name === name))
    .then((team) => team.length > 0);

const getAllTeamsPageWise = (per_page = 100, page = 1) =>
  octokit.teams
    .list({
      org,
      per_page,
      page,
    })
    .then((teams) => teams.data);

// Create cohort github team if not present
// Links parent team if parent_team_id is present
export const createTeam = (
  name,
  program_id,
  location,
  start_date,
  parent_team_id = null
) => {
  const teamName = teamNameFormat(name, program_id, location, start_date);
  return teamPresentOrNot(teamName)
    .then((present) =>
      present ? {} : createGitHubTeam(teamName, parent_team_id)
    )
    .then(() => teamName);
};

export const moveLearnerToNewGithubTeam = async (
  learner_id,
  current_cohort_id,
  future_cohort_id
) => {
  let sc = await getGithubConnecionByUserId(learner_id);
  if (!sc) {
    return;
  }

  let current_cohort = await getCohortFromId(current_cohort_id);
  let future_cohort = await getCohortFromId(future_cohort_id);
  let current_team_name = teamNameFormat(
    current_cohort.name,
    current_cohort.program_id,
    current_cohort.location,
    current_cohort.start_date
  );
  let future_team_name = teamNameFormat(
    future_cohort.name,
    future_cohort.program_id,
    future_cohort.location,
    future_cohort.start_date
  );

  await removeMemberFromTeam(current_team_name, sc.username);
  return addMemberToTeam(future_team_name, sc.username);
};

export const removeLearnerFromGithubTeam = async (
  learner_id,
  current_cohort_id
) => {
  let current_cohort = await getCohortFromId(current_cohort_id);
  let current_team_name = teamNameFormat(
    current_cohort.name,
    current_cohort.program_id,
    current_cohort.location,
    current_cohort.start_date
  );

  let sc = await getGithubConnecionByUserId(learner_id);
  return removeMemberFromTeam(current_team_name, sc.username);
};
