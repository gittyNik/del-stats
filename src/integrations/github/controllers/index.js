import _ from 'lodash';
import { octokit, org } from './git.auth.controller';
import {
  createTeam,
  getTeamIdByName,
  isEducator,
  toSentenceCase,
  moveLearnerToNewGithubTeam,
} from './teams.controller';
import { sendInvitesToNewMembers } from './orgs.controller';
import {
  getAllRepos,
  createGithubRepositoryFromTemplate,
  addCollaboratorToRepository,
  repositoryPresentOrNot,
  isRepositoryCollaborator,
  createGithubRepository,
  createRepositoryifnotPresentFromTemplate,
  provideAccessToRepoIfNot,
  deleteGithubRepository,
} from './repository.controller';
import {
  getAllAuthoredCommits,
  getAllCommits,
  getAllCommitsByUser,
  getRecentCommitInRepository,
  getCommitsBetweenDates,
  getAuthoredCommitsBetweenDates,
} from './commits.controller';
import {
  getTeamsbyCohortMilestoneId,
  createMilestoneTeams,
  getLearnerTeamOfMilestone,
  getAllLearnerTeamsByUserId,
} from '../../../models/team';
import { getCohortFromId, getCohortMilestones } from '../../../models/cohort';
import { getGithubConnecionByUserId } from '../../../models/social_connection';
import {
  learnerChallengesFindOrCreate,
  getChallengesByUserId,
  latestChallengeInCohort,
} from '../../../models/learner_challenge';
import {
  contributersInRepository,
  weeklyCommitActivityData,
} from './stats.controller';
import {
  getCohortMilestonesByCohortId,
  getCohortMilestoneTeams,
} from '../../../models/cohort_milestone';
import { getProfile, getUserFromEmails } from '../../../models/user';


// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
  const { repo_name } = req.query;
  const user_id = req.jwtData.user.id;
  let socialConnection = await getGithubConnecionByUserId(user_id);
  getAllCommits(repo_name, socialConnection)
    .then(data => res.send({ data }))
    .catch(err => res.status(500).send(err));
};

const getLatestCommitInCohort = async cohort_milestone_id => {
  let commits = [];
  let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
  teams = teams.map(team => team.github_repo_link);
  for (let i = 0; i < teams.length; i++) {
    let commit = await getRecentCommitInRepository(teams[i]);
    if (!commit.hasOwnProperty('sha')) {
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
  milestone_repo_name,
) => {
  const socialConnection = await getGithubConnecionByUserId(user_id);
  const teamCommits = await getAllCommits(milestone_repo_name);
  const userCommits = await getAllAuthoredCommits(
    milestone_repo_name,
    socialConnection.username,
  );
  return {
    teamCommits: teamCommits.length,
    userCommits: userCommits.length,
  };
};

const getTotalTeamAndUserCommits = async (req, res) => {
  try {
    const { milestone_repo_name } = req.params;
    const user_id = req.jwtData.user.id;
    const count = await getTotalTeamAndUserCommitsCount(
      user_id,
      milestone_repo_name,
    );
    res.send({
      data: count,
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
    .then(challenges => res.send({ data: { noOfChallenges: challenges.length } }))
    .catch(err => res.status(500).send(err));
};

const getTotalCohortCommits = async (req, res) => {
  try {
    const { cohort_milestone_id } = req.params;
    let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
    let commits = 0;
    for (let i = 0; i < teams.length; i++) {
      let commit = await getAllCommits(teams[i].github_repo_link); // needs to be repo name not links
      commits += commit;
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
        teams[i].github_repo_link,
      );
      let com = await getAllAuthoredCommits(
        teams[i].github_repo_link,
        username,
      );
      if (com.length == 0) {
        teams[i] = {
          noOfLines: 0,
          cohort_milestone_id: teams[i].cohort_milestone_id,
          commits: 0,
        };
        continue;
      }
      teams[i] = { team: teams[i], cont, commits: com.length };
      if (!_.isEmpty(cont)) {
        for (let j = 0; j < teams[i].cont.length; j++) {
          if (teams[i].cont[j].author.login === username) {
            teams[i].cont = teams[i].cont[j];
            break;
          }
        }
      }
    }
    for (let i = 0; i < teams.length; i++) {
      let a = 0;
      let d = 0;
      if ('noOfLines' in teams[i]) {
        continue;
      }
      if (!_.isEmpty(teams[i].cont)) {
        for (let j = 0; j < teams[i].cont.weeks.length; j++) {
          a += teams[i].cont.weeks[j].a;
          d += teams[i].cont.weeks[j].d;
        }
      }
      teams[i] = {
        noOfLines: a - d,
        cohort_milestone_id: teams[i].team.cohort_milestone_id,
        commits: teams[i].commits,
      };
    }
    return teams;
  } catch (err) {
    return err;
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
        commits: 1,
      };
      commits.pop();
      first = false;
      continue;
    }
    let commit = commits[0];
    if (
      isoToDateString(commit.commit.committer.date)
      !== dayWiseCommits[index].day
    ) {
      index++;
    }
    dayWiseCommits[index] = {
      day: isoToDateString(commit.commit.committer.date),
      commits: dayWiseCommits[index] === undefined
        ? 1
        : dayWiseCommits[index].commits + 1,
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
    new Date(Date.now()).toISOString(),
  );
  for (let i = 0; i < learners.length; i++) {
    let user = learners[i];
    let socialConnection = await getGithubConnecionByUserId(user.id);
    if (socialConnection === null) {
      ret.push({
        user_id: user.id,
        gitUsername: null,
        userCommitsDayWise: 0,
      });
    } else {
      let authorCommits = await getAuthoredCommitsBetweenDates(
        repo,
        new Date(twoWeeks).toISOString(),
        new Date(Date.now()).toISOString(),
        socialConnection.username,
      );
      ret.push({
        user_id: user.id,
        gitUsername: socialConnection.username,
        userCommitsDayWise: commitsDayWise(twoWeeks, authorCommits),
      });
    }
  }
  return {
    userCommitsDayWise: ret,
    teamCommitsDayWise: commitsDayWise(twoWeeks, commits),
  };
};

export const getGithubStats = async (cohort_id, user_id) => {
  // Fetch Cohort Milestone Teams
  let cohortMilestones = await getCohortMilestoneTeams(cohort_id);

  let allMilestoneCommitsPromises = await Promise.all(
    cohortMilestones.map(async cohortMilestone => {
      // For Every Cohort fetch Teams
      const cohort_milestone_id = cohortMilestone.id;
      let cohortMilestoneTeams = cohortMilestone.milestone_learner_teams;
      let milestoneCommitPromises = [];
      if (!(_.isEmpty(cohortMilestoneTeams))) {
        milestoneCommitPromises = await Promise.all(cohortMilestoneTeams.map(async eachTeam => {
          // For each team get Milestone repo
          let github_repo = eachTeam.github_repo_link;
          let teamLearners = eachTeam.learners;

          // Get Github token for one learner and use it to get all commits
          let userSocialConnection = await getGithubConnecionByUserId(user_id);

          let contributorsRepo;
          try {
            contributorsRepo = await contributersInRepository(github_repo, userSocialConnection);
          } catch (err) {
            console.log(err);
            contributorsRepo = [];
          }

          let learnerCommits = await Promise.all(teamLearners.map(async oneLearner => {
            // Get Github token for one learner and use it to get all commits
            let socialConnection = await getGithubConnecionByUserId(oneLearner);
            let milestoneData;
            if (_.isEmpty(socialConnection)) {
              socialConnection = userSocialConnection;
            }
            // Fetch commits for entire repo
            milestoneData = await getAllAuthoredCommits(
              github_repo,
              socialConnection.username,
              socialConnection,
            );

            return { milestoneData, user_id: oneLearner };
          }));
          return { learnerCommits, cohort_milestone_id, contributorsRepo };
        }));
      }
      return milestoneCommitPromises;
    }),
  );

  return allMilestoneCommitsPromises;
};

export const fillGithubStats = async (req, res) => {
  const { cohort_id } = req.query;
  // const user_id = req.jwtData.user.id;
  const user_id = '929ae71d-105b-4b0e-a6d4-cf28824e6392';

  let allMilestoneCommitsPromises = await getGithubStats(cohort_id, user_id);
  res.send(allMilestoneCommitsPromises);
};

export const getAllStats = async (req, res) => {
  const { cohort_id, cohort_milestone_id } = req.params;
  const user_id = req.jwtData.user.id;
  let socialConnection = await getGithubConnecionByUserId(user_id);

  if (socialConnection !== null) {
    let cohortDetails = await getCohortMilestones(cohort_id);
    let cohortLearner = cohortDetails.learners;

    let LatestChallengeInCohort = await latestChallengeInCohort(
      cohort_id,
    );
    let latChalUser;
    if (LatestChallengeInCohort === undefined) {
      LatestChallengeInCohort = 0;
      latChalUser = 0;
    } else {
      latChalUser = await getProfile(LatestChallengeInCohort.learner_id);
    }

    res.send({
      data: {
        noOfCommitsLinesOfEachMS: first,
        noOfCommitsLinesOfEachMSForUser: { a, user_id },
        noOfCommitsAndLearnerDetails: third,
        LatestChallengeInCohort: {
          challenge: LatestChallengeInCohort,
          user: latChalUser,
          cohort: ch,
        },
        latestCommitInCohort: {
          commit: latestCommitInCohort,
          user: u,
        },
      },
    });
  } else {
    res.send({
      data: {
        noOfCommitsLinesOfEachMS: 0,
        noOfCommitsLinesOfEachMSForUser: 0,
        noOfCommitsAndLearnerDetails: 0,
        LatestChallengeInCohort: 0,
        latestCommitInCohort: 0,
      },
    });
  }
};

const allStats = async (req, res) => {
  try {
    const { cohort_id, cohort_milestone_id } = req.params;
    const user_id = req.jwtData.user.id;
    let socialConnection = await getGithubConnecionByUserId(user_id);
    if (socialConnection !== null) {
      let first = [];
      let third = [];
      let ch = await getCohortFromId(cohort_id);
      for (let i = 0; i < ch.learners.length; i++) {
        let sc = await getGithubConnecionByUserId(ch.learners[i]);
        if (sc === null) {
          first.push({
            noOfLines: 0,
            cohort_milestone_id: 0,
            commits: 0,
            user_id: ch.learners[i],
            challengesAttempted: 0,
          });
          continue;
        }
        let a = await numberOfLinesInEachMilestone(
          cohort_id,
          ch.learners[i],
          sc.username,
        );
        let c = await getChallengesByUserId(ch.learners[i]);
        a.map(ab => first.push({
          noOfLines: ab.noOfLines,
          cohort_milestone_id: ab.cohort_milestone_id,
          commits: ab.commits,
          user_id: ch.learners[i],
          challengesAttempted: c !== null ? c.length : 0,
        }));
      }
      //* ******************//
      let a = await numberOfLinesInEachMilestone(
        cohort_id,
        user_id,
        socialConnection.username,
      );

      for (let i = 0; i < ch.learners.length; i++) {
        let c = 0;
        let teams = await getAllLearnerTeamsByUserId(ch.learners[i]);
        let sc = await getGithubConnecionByUserId(ch.learners[i]);
        if (sc === null) {
          first.push({
            noOfLines: 0,
            cohort_milestone_id: 0,
            commits: 0,
            user_id: ch.learners[i],
            challengesAttempted: 0,
          });
          continue;
        }
        for (let j = 0; j < teams.length; j++) {
          let com = await getAllAuthoredCommits(
            teams[j].github_repo_link,
            sc.username,
          );
          c += com.length;
        }
        let user = await getProfile(ch.learners[i]);
        third.push({
          noOfCommits: c,
          user,
        });
      }

      let teams = await getTeamsbyCohortMilestoneId(cohort_milestone_id);
      for (let i = 0; i < teams.length; i++) {
        let commits = await getAllCommits(teams[i].github_repo_link);
        teams[i] = { team: teams[i], commits };
      }
      let LatestChallengeInCohort = await latestChallengeInCohort(
        cohort_id,
      );
      let latChalUser;
      if (LatestChallengeInCohort === undefined) {
        LatestChallengeInCohort = 0;
        latChalUser = 0;
      } else {
        latChalUser = await getProfile(LatestChallengeInCohort.learner_id);
      }

      const latestCommitInCohort = await getLatestCommitInCohort(
        cohort_milestone_id,
      );
      let u = await getUserFromEmails([latestCommitInCohort.commit.committer.email]);

      res.send({
        data: {
          noOfCommitsLinesOfEachMS: first,
          noOfCommitsLinesOfEachMSForUser: { a, user_id },
          noOfCommitsAndLearnerDetails: third,
          LatestChallengeInCohort: {
            challenge: LatestChallengeInCohort,
            user: latChalUser,
            cohort: ch,
          },
          latestCommitInCohort: {
            commit: latestCommitInCohort,
            user: u,
          },
        },
      });
    } else {
      res.send({
        data: {
          noOfCommitsLinesOfEachMS: 0,
          noOfCommitsLinesOfEachMSForUser: 0,
          noOfCommitsAndLearnerDetails: 0,
          LatestChallengeInCohort: 0,
          latestCommitInCohort: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
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
  allStats,
  moveLearnerToNewGithubTeam,
  deleteGithubRepository,
};
