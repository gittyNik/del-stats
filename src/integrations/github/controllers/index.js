import _ from 'lodash';
import { octokit, org } from './git.auth.controller';
import {
  createTeam,
  getTeamIdByName,
  isEducator,
  toSentenceCase,
  moveLearnerToNewGithubTeam,
  removeLearnerFromGithubTeam,
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
  isExistingRepository,
  addTeamAccessToRepo,
} from './repository.controller';
import {
  getAllAuthoredCommits,
  getAllCommits,
  getRecentCommitInRepository,
  getCommitsBetweenDates,
  getAuthoredCommitsBetweenDates,
} from './commits.controller';
import {
  getTeamsbyCohortMilestoneId,
  createMilestoneTeams,
  getAllLearnerTeamsByUserId,
  getLearnerMilestoneTeam,
} from '../../../models/team';
import {
  getCohortFromId,
} from '../../../models/cohort';
import {
  getGithubConnecionByUserId,
  getGithubByUserId,
  getGithubNameByUserId,
} from '../../../models/social_connection';
import {
  learnerChallengesFindOrCreate,
  getChallengesByUserId,
  latestChallengeInCohort,
  getLearnerChallengesAfterDate,
  getLearnerChallengesBetweenDate,
} from '../../../models/learner_challenge';
import {
  contributersInRepository,
  weeklyCommitActivityData,
} from './stats.controller';
import {
  getCohortMilestoneTeamsBeforeDate,
  getCohortMilestone,
  findInCohortMilestones,
  getCohortMilestoneIds,
} from '../../../models/cohort_milestone';
import { getProfile, getUserFromEmails } from '../../../models/user';
import {
  createOrUpdteLearnerGithubDataForMilestone,
  getAllCohortGithubMilestoneData,
  getTotalLearnerCommitsForCohort,
  getLastUpdatedMilestoneCommit,
  getLastUpdatedMilestoneCommitInCohort,
  getLastUpdatedMilestoneCommitByUser,
  getTeamMilestoneCommitsCount,
  getUserMilestoneCommitsCount,
  getLastMilestoneCommitInCohort,
} from '../../../models/learner_github_milestones';
import {
  createOrUpdateLearnerGithubDataForChallenge,
  getLastUpdatedChallengeUpdatedDate,
  getTotalChallengeCommitsForCohort,
  getChallengesForCohortMilestone,
  getLastUpdatedChallengeInCohort,
  getLastUpdatedChallengeByUser,
  getLastChallengeInCohort,
} from '../../../models/learner_github_challenges';
import {
  getTopicById,
} from '../../../models/topic';

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
const getRecentCommit = async (req, res) => {
  const { repo_name } = req.query;
  const user_id = req.jwtData.user.id;
  let socialConnection = await getGithubConnecionByUserId(user_id);
  getAllCommits(repo_name, socialConnection)
    .then(data => res.send({ data }))
    .catch(err => res.status(500).send(err));
};

export const checkRepoExist = async (req, res) => {
  const { repo_name } = req.query;
  isExistingRepository(repo_name)
    .then(data => res.send({ data }))
    .catch(err => res.status(500).send(err));
};

const createChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.jwtData.user.id;
    learnerChallengesFindOrCreate(id, user_id)
      .then((data) => res.send({ data }))
      .catch((err) => res.status(500).send(err));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getTotalTeamAndUserCommitsCount = async (
  user_id,
  team_id,
) => {
  const teamCommits = await getTeamMilestoneCommitsCount(team_id);
  const userCommits = await getUserMilestoneCommitsCount(user_id, team_id);
  return {
    teamCommits,
    userCommits,
  };
};

// DO NOT USE
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
  let tempSocialConnection = {
    access_token: `access_token=${process.env.GITHUB_ACCESS_TOKEN}&`,
  };
  contributersInRepository(milestone_repo_name, tempSocialConnection)
    .then(async data => {
      let socialConnection = await getGithubConnecionByUserId(user_id);
      let commits = 0;
      data.map((dt) => {
        if (dt.author.login === socialConnection.username) {
          commits = dt.weeks[0].c;
        }
        return commits;
      });
      res.send({ data: { numberOfCommits: commits } });
    }).catch(err => res.status(500).send(err));
};

const createMilestoneTeamsbyCohortMilestoneId = async (req, res) => {
  const { cohort_milestone_id } = req.params;
  createMilestoneTeams(cohort_milestone_id)
    .then((data) => res.send({ data }))
    .catch((err) => res.status(500).send(err));
};

const numberOfAttemptedChallenges = async (req, res) => {
  const user_id = req.jwtData.user.id;
  getChallengesByUserId(user_id)
    .then((challenges) => res.send({ data: { noOfChallenges: challenges.length } }))
    .catch((err) => res.status(500).send(err));
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
      let cont = await contributersInRepository(teams[i].github_repo_link);
      let com = await getAllAuthoredCommits(
        teams[i].github_repo_link,
        username,
      );
      if (com.length === 0) {
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

const isoToDateString = (str) => {
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
    let temp = _.filter(dayWiseCommits, (el) => el.day === d);
    if (temp.length === 0) {
      temp = { day: d, commits: 0 };
    } else {
      [temp] = temp;
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

export const getContributorsInRepo = async (github_repo, socialConnection) => {
  let contributorsRepo;

  contributorsRepo = await contributersInRepository(github_repo, socialConnection);
  if (contributorsRepo === null) {
    let tempSocialConnection = {
      access_token:
        `access_token=${process.env.GITHUB_ACCESS_TOKEN}&`,
    };
    contributorsRepo = await contributersInRepository(github_repo,
      tempSocialConnection);
  }
  return contributorsRepo;
};

// Pass user_id, github repo and Social connection For requesting user
export const apiForOneLearnerGithubMilestone = async (oneLearner,
  github_repo, socialConnection = null, since = null) => {
  let milestoneData;

  // In-case of backfill, socialConnection and below are different
  let eachUserSocialConnection = await getGithubConnecionByUserId(oneLearner);
  if (_.isEmpty(socialConnection) && _.isEmpty(eachUserSocialConnection)) {
    let tempSocialConnection = {
      access_token:
        `access_token=${process.env.GITHUB_ACCESS_TOKEN}&`,
    };
    socialConnection = tempSocialConnection;
  }
  if (_.isEmpty(socialConnection)) {
    socialConnection = eachUserSocialConnection;
  }

  // Fetch commits for entire repo
  if ((socialConnection) && (eachUserSocialConnection)) {
    try {
      milestoneData = await getAllAuthoredCommits(
        github_repo,
        eachUserSocialConnection.username,
        socialConnection,
        since,
      );
    } catch (err) {
      try {
        let tempSocialConnection = {
          access_token:
            `access_token=${process.env.GITHUB_ACCESS_TOKEN}&`,
        };
        milestoneData = await getAllAuthoredCommits(
          github_repo,
          eachUserSocialConnection.username,
          tempSocialConnection,
          since,
        );
      } catch (err2) {
        return { milestoneData: [[]], user_id: oneLearner };
      }
    }
    return { milestoneData, user_id: oneLearner };
  }
  milestoneData = [];
  return { milestoneData, user_id: oneLearner };
};

export const getGithubStats = async (cohort_id, before_date, after_date) => {
  // Fetch Cohort Milestone Teams
  before_date = new Date(before_date);
  after_date = new Date(after_date);
  let cohortMilestones = await getCohortMilestoneTeamsBeforeDate(
    cohort_id,
    before_date,
    after_date,
  );

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
          let team_id = eachTeam.id;

          // Get Github token for one learner and use it to get all commits
          let socialConnection = await getGithubConnecionByUserId(teamLearners[0]);
          let contributorsRepo = await getContributorsInRepo(github_repo, socialConnection);

          // For every learner fetch commits from a milestone repo
          let learnerCommits = await Promise.all(teamLearners.map(
            async oneLearner => apiForOneLearnerGithubMilestone(oneLearner,
              github_repo,
              socialConnection),
          ));
          return {
            learnerCommits, cohort_milestone_id, contributorsRepo, team_id,
          };
        }));
      }
      return milestoneCommitPromises;
    }),
  );

  return allMilestoneCommitsPromises;
};

export const getGithubChallengesStats = async (cohort_id, start_date, end_date) => {
  // Fetch Learner details
  let cohortDetails = await getCohortFromId(cohort_id);
  let cohortLearners = cohortDetails.learners;

  let allMilestoneCommitsPromises = await Promise.all(
    cohortLearners.map(async learner => {
      // For Every Learner fetch Challenges commit
      let allLearnerChallenges = await getChallengesByUserId(learner, start_date, end_date);
      let learnerCommitPromises = [];
      if (!(_.isEmpty(allLearnerChallenges))) {
        learnerCommitPromises = await Promise.all(allLearnerChallenges.map(async eachChallenge => {
          // For each challenge, get stats
          let github_repo = eachChallenge.repo;
          let challengeId = eachChallenge.id;

          // Get Cohort Milestone id
          let { milestone_id } = await getTopicById(eachChallenge.challenge.topic_id);
          let { id: cohort_milestone_id } = await getCohortMilestone(cohort_id, milestone_id);

          // Get Github token for one learner and use it to get all commits
          let socialConnection = await getGithubConnecionByUserId(learner);
          let contributorsRepo = await getContributorsInRepo(github_repo, socialConnection);

          // For every learner fetch commits from a challenge repo
          let learnerCommits = await apiForOneLearnerGithubMilestone(learner,
            github_repo,
            socialConnection);
          return {
            learnerCommits, challengeId, contributorsRepo, user_id: learner, cohort_milestone_id,
          };
        }));
      }
      return learnerCommitPromises;
    }),
  );

  return allMilestoneCommitsPromises;
};

// export const fillGithubStats = async (req, res) => {
//   const { cohort_id } = req.query;

//   let allMilestoneCommitsPromises = await getGithubStats(cohort_id);
//   res.send(allMilestoneCommitsPromises);
// };

export const getTotalNumberOfLines = (total,
  current) => total + (current.a - current.d);

export const getTotalCommits = (total, current) => total + (current.c);

export const createStatForSingleLearner = async (
  eachLearnerCommit,
  team_id = null, cohort_milestone_id = null,
  contributorsRepo,
  learner_challenge_id = null,
) => {
  // Keys to keep in commits, remove unwanted data
  const keys_to_keep = ['commit', 'sha'];
  const reduced_commit_array = array => array.map(o => keys_to_keep.reduce((acc, curr) => {
    if (curr === 'commit') {
      o[curr] = {
        author: o[curr].author.name,
        message: o[curr].message,
        commit_date: o[curr].author.date,
      };
    }
    acc[curr] = o[curr];
    return acc;
  }, {}));

  let { milestoneData, user_id } = eachLearnerCommit;
  if (_.isEmpty(milestoneData[0]) && _.isEmpty(contributorsRepo)) {
    // Insert Empty Stats
    if (learner_challenge_id) {
      return createOrUpdateLearnerGithubDataForChallenge(
        learner_challenge_id, 0, [], null, 0, cohort_milestone_id,
      );
    }
    return createOrUpdteLearnerGithubDataForMilestone(
      user_id, team_id, 0, [],
      cohort_milestone_id, 0, null,
    );
  }
  let createdStat;
  if (Array.isArray(contributorsRepo)) {
    if ((contributorsRepo) && (_.isEmpty(milestoneData[0]))) {
      let gitName = await getGithubNameByUserId(user_id);

      if (gitName === null) {
        // Insert Empty Stats
        if (learner_challenge_id) {
          return createOrUpdateLearnerGithubDataForChallenge(
            learner_challenge_id, 0, [], null, 0, cohort_milestone_id,
          );
        }
        return createOrUpdteLearnerGithubDataForMilestone(
          user_id, team_id, 0, [],
          cohort_milestone_id, 0, null,
        );
      }

      let userStats = contributorsRepo.filter((item) => item.author.login === gitName.username);
      let numberOfLines;
      let totalCommits;
      let last_committed_at;
      try {
        numberOfLines = userStats[0].weeks.reduce(
          getTotalNumberOfLines, 0,
        );
        totalCommits = userStats[0].weeks.reduce(getTotalCommits, 0);
      } catch (err) {
        numberOfLines = 0;
        totalCommits = 0;
      }
      let allCommits = [];
      try {
        last_committed_at = new Date(userStats[0].weeks[0].w * 1000);
      } catch (err3) {
        last_committed_at = null;
      }

      if (learner_challenge_id) {
        return createOrUpdateLearnerGithubDataForChallenge(
          learner_challenge_id, numberOfLines, allCommits, last_committed_at, totalCommits,
          cohort_milestone_id,
        );
      }
      return createOrUpdteLearnerGithubDataForMilestone(
        user_id, team_id, numberOfLines, allCommits,
        cohort_milestone_id, totalCommits, last_committed_at,
      );
    }
    createdStat = milestoneData.map((eachCommit) => {
      let author = eachCommit[0].author.login;

      // Get all User stats from All stats for repo
      let userStats = contributorsRepo.filter((item) => item.author.login === author);
      let numberOfLines;
      let totalCommits;
      try {
        numberOfLines = userStats[0].weeks.reduce(
          getTotalNumberOfLines, 0,
        );
        totalCommits = userStats[0].weeks.reduce(getTotalCommits, 0);
      } catch (err) {
        numberOfLines = 0;
        totalCommits = 0;
      }
      let allCommits = reduced_commit_array(eachCommit);
      let last_committed_at = allCommits[0].commit.commit_date;

      if (learner_challenge_id) {
        return createOrUpdateLearnerGithubDataForChallenge(
          learner_challenge_id, numberOfLines, allCommits, last_committed_at, totalCommits,
          cohort_milestone_id,
        );
      }
      return createOrUpdteLearnerGithubDataForMilestone(
        user_id, team_id, numberOfLines, allCommits,
        cohort_milestone_id, totalCommits, last_committed_at,
      );
    });
  } else {
    console.warn(`Contributors in repo: ${contributorsRepo}`);
  }
  return createdStat;
};

export const addTeamAccessRepo = async (req, res) => {
  const { team_slug, repo, permissions } = req.query;
  let permissionsTeam = await addTeamAccessToRepo(team_slug, repo, permissions);

  return res.json({ data: permissionsTeam });
};

export const fillGithubStats = async (req, res) => {
  const { cohort_id, before_date, after_date } = req.query;

  let allMilestoneCommits = await getGithubStats(cohort_id, before_date, after_date);
  let savedCommitsDB = allMilestoneCommits.map(singleMilestoneCommits => {
    let teamCommits = singleMilestoneCommits.map(teamMilestoneCommit => {
      let {
        cohort_milestone_id,
        contributorsRepo,
        learnerCommits,
        team_id,
      } = teamMilestoneCommit;

      let commitsData = Promise.all(learnerCommits.map(
        async (eachLearnerCommit) => createStatForSingleLearner(
          eachLearnerCommit,
          team_id,
          cohort_milestone_id,
          contributorsRepo,
        ),
      ));
      return commitsData;
    });
    return teamCommits;
  });
  res.send(savedCommitsDB);
};

export const getChallengesData = async (cohort_id, start_date, end_date) => {
  let allMilestoneCommits = await getGithubChallengesStats(cohort_id, start_date, end_date);
  let savedCommitsDB = await Promise.all(allMilestoneCommits.map(singleMilestoneCommits => {
    let teamCommits = singleMilestoneCommits.map(teamMilestoneCommit => {
      let {
        challengeId: learner_challenge_id,
        contributorsRepo,
        learnerCommits,
        cohort_milestone_id,
      } = teamMilestoneCommit;

      let commitsData = createStatForSingleLearner(
        learnerCommits, null, cohort_milestone_id, contributorsRepo, learner_challenge_id,
      );
      return commitsData;
    });
    return teamCommits;
  }));
  return savedCommitsDB;
};

export const fillGithubChallengesStats = async (req, res) => {
  const { cohort_id, start_date, end_date } = req.query;

  let savedCommitsDB = await getChallengesData(cohort_id, start_date, end_date);
  res.send(savedCommitsDB);
};

// Get Total commits and no lines User has added throughout program
export const getTotalMilestoneChallengeCommits = async (user_id) => {
  let noOfCommits = 0;
  let noOfLines = 0;
  let user = { id: user_id };
  let totalProgramMilestoneCommits = await getTotalLearnerCommitsForCohort(user_id);

  if (totalProgramMilestoneCommits[0]) {
    noOfCommits += parseInt(totalProgramMilestoneCommits[0].nocommits, 10);
    noOfLines += parseInt(totalProgramMilestoneCommits[0].nolines, 10);
    user.name = totalProgramMilestoneCommits[0]['user.name'];
  }

  let totalChallengesCommits = await getTotalChallengeCommitsForCohort(user_id);

  if (totalChallengesCommits[0]) {
    noOfCommits += parseInt(totalChallengesCommits[0].nocommits, 10);
    noOfLines += parseInt(totalChallengesCommits[0].nolines, 10);
  }

  return { noOfCommits, noOfLines, user };
};

export const getCohortMilestoneStatsUser = async learner => {
  let noOfCommitsLinesOfAllMS = await getAllCohortGithubMilestoneData(learner);
  let user;
  try {
    user = {
      id: noOfCommitsLinesOfAllMS[0].userId,
      name: noOfCommitsLinesOfAllMS[0]['user.name'],
    };
  } catch (err) {
    user = null;
    console.warn(`User with id: ${learner} does not exists`);
  }

  return Promise.all(noOfCommitsLinesOfAllMS.map(async forCohortMilestone => {
    let challengesAttempted = 0;

    let {
      cohort_milestone_id, commits,
      number_of_lines, repository_commits,
      last_committed_at,
    } = forCohortMilestone;

    if (commits === null) {
      commits = 0;
      number_of_lines = 0;
      repository_commits = [];
    }

    let allChallengesAttempted = await getChallengesForCohortMilestone(
      learner,
      cohort_milestone_id,
    );
    if ((allChallengesAttempted) && (allChallengesAttempted.length > 0)) {
      commits += parseInt(allChallengesAttempted[0].nocommits, 10);
      number_of_lines += parseInt(allChallengesAttempted[0].nolines, 10);
      challengesAttempted += parseInt(allChallengesAttempted[0].count, 10);
    }
    return {
      noOfLines: number_of_lines,
      cohort_milestone_id,
      repository_commits,
      commits,
      user,
      challengesAttempted,
      lastComittedAt: last_committed_at,
    };
  }));
};

export const getRecentCommitByUser = async (user_id) => {
  let latestCommit;
  let lastChallenge = await getLastUpdatedChallengeByUser(user_id);

  let lastMilestone = await getLastUpdatedMilestoneCommitByUser(user_id);
  if ((lastChallenge === null) && (lastMilestone)) {
    return lastMilestone;
  }
  if ((lastMilestone === null) && (lastChallenge)) {
    return lastChallenge;
  }
  if ((lastMilestone === null) && (lastChallenge === null)) {
    return {};
  }
  latestCommit = lastChallenge.last_committed_at > lastMilestone.last_committed_at ? lastChallenge : lastMilestone;
  return latestCommit;
};

export const getLatestCommitInCohort = async (cohort_milestone_id) => {
  let latestCommit;
  let lastChallenge = await getLastUpdatedChallengeInCohort(cohort_milestone_id);

  let lastMilestone = await getLastUpdatedMilestoneCommitInCohort(cohort_milestone_id);
  if ((lastChallenge === null) && (lastMilestone)) {
    return lastMilestone;
  }
  if ((lastMilestone === null) && (lastChallenge)) {
    return lastChallenge;
  }
  if ((lastMilestone === null) && (lastChallenge === null)) {
    return {};
  }
  latestCommit = lastChallenge.last_committed_at > lastMilestone.last_committed_at ? lastChallenge : lastMilestone;
  return latestCommit;
};

export const getLatestCommitCohort = async (cohort_id) => {
  let latestCommit;
  let cohort_milestone_ids = await getCohortMilestoneIds(cohort_id);
  let cohort_milestones = cohort_milestone_ids.map(({ id }) => id);

  let lastChallenge = await getLastChallengeInCohort(cohort_milestones);

  let lastMilestone = await getLastMilestoneCommitInCohort(cohort_milestones);

  if ((lastChallenge === null) && (lastMilestone)) {
    return lastMilestone;
  }
  if ((lastMilestone === null) && (lastChallenge)) {
    return lastChallenge;
  }
  if ((lastMilestone === null) && (lastChallenge === null)) {
    return {};
  }
  latestCommit = lastChallenge.last_committed_at > lastMilestone.last_committed_at ? lastChallenge : lastMilestone;
  return latestCommit;
};

export const getAllStats = async (req, res) => {
  const { cohort_id, cohort_milestone_id } = req.params;
  const user_id = req.jwtData.user.id;
  // Get Social connection of User

  try {
    let socialConnection = await getGithubByUserId(user_id);
    let lastUpdatedChallenge = await getLastUpdatedChallengeUpdatedDate(user_id);
    let lastChallengeUpdated;

    if (lastUpdatedChallenge === null) {
      lastChallengeUpdated = null;
    } else {
      lastChallengeUpdated = lastUpdatedChallenge.updated_at;
    }
    if (lastChallengeUpdated === null) {
      lastChallengeUpdated = new Date();
      lastChallengeUpdated.setDate(lastChallengeUpdated.getDate() - 2);
    }
    let updateChallenges = await getLearnerChallengesAfterDate(
      lastChallengeUpdated,
      user_id,
    );

    let lastMilestoneUpdatedAt;
    lastMilestoneUpdatedAt = await getLastUpdatedMilestoneCommit(user_id, cohort_milestone_id);
    if ((lastMilestoneUpdatedAt === null) || (lastMilestoneUpdatedAt.last_committed_at === null)) {
      let lastMilestoneUpdated = new Date();
      lastMilestoneUpdated.setDate(lastMilestoneUpdated.getDate() - 2);
      lastMilestoneUpdatedAt = { last_committed_at: lastMilestoneUpdated };
    }

    if (socialConnection !== null) {
      // Update any new changes to Milestone Repo
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      const NOW = new Date();
      if ((NOW - lastMilestoneUpdatedAt) > TWO_HOURS) {
        await getGithubStats(cohort_id, NOW, lastMilestoneUpdatedAt);
      }

      if (updateChallenges) {
        // Update any new changes to Challenges
        let currentDate = new Date();
        await getChallengesData(cohort_id, lastChallengeUpdated, currentDate);
      }

      let cohortDetails = await getCohortFromId(cohort_id);
      let cohortLearners = cohortDetails.learners;
      let noOfCommitsLinesOfEachMS = [];
      let noOfCommitsLinesOfEachMSForUserId;
      let totalProgramMilestoneCommits;
      let noOfCommitsAndLearnerDetails = [];
      let milestoneStats = [];
      await Promise.all(cohortLearners.map(async learner => {
        let noOfCommitsLinesOfEachMSPerUser = await getCohortMilestoneStatsUser(learner);
        if (learner === user_id) {
          noOfCommitsLinesOfEachMSForUserId = noOfCommitsLinesOfEachMSPerUser;
        }

        totalProgramMilestoneCommits = await getTotalMilestoneChallengeCommits(learner);
        noOfCommitsLinesOfEachMS.push(...noOfCommitsLinesOfEachMSPerUser);
        let currentCohortCommits = noOfCommitsLinesOfEachMSPerUser.filter(
          cohortCommits => cohortCommits.cohort_milestone_id === cohort_milestone_id,
        );
        milestoneStats.push(...currentCohortCommits);
        noOfCommitsAndLearnerDetails.push(totalProgramMilestoneCommits);
      }));

      let LatestChallengeInCohortId = await latestChallengeInCohort(cohort_id);

      let latestCommitInCohortId = await getLatestCommitCohort(cohort_id);

      // sorting descending order
      noOfCommitsAndLearnerDetails.sort((a, b) => ((a.noOfCommits > b.noOfCommits) ? -1 : 1));

      let author;
      let message;
      let commit_date;
      try {
        let latestCommits = latestCommitInCohortId.repository_commits;
        let commitDetails = latestCommits[0];
        author = commitDetails.commit.author;
        message = commitDetails.commit.message;
        commit_date = commitDetails.commit.commit_date;
      } catch (err) {
        console.warn(`Unable to get committer details: ${err}`);
      }

      res.send({
        data: {
          noOfCommitsLinesOfEachMS,
          noOfCommitsLinesOfEachMSForUser: { a: noOfCommitsLinesOfEachMSForUserId, user_id },
          noOfCommitsAndLearnerDetails,
          LatestChallengeInCohort: {
            challenge: LatestChallengeInCohortId,
            user: {
              id: LatestChallengeInCohortId['user.id'],
              name: LatestChallengeInCohortId['user.name'],
            },
            cohort: cohortDetails,
          },
          latestCommitInCohort: {
            commit: latestCommitInCohortId,
            user: author,
            message,
            commit_date,
          },
          milestone: { stats: milestoneStats },
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
          milestone: 0,
        },
      });
    }
  } catch (err) {
    console.error(`Error while fetching Github Stats for User ${user_id} ${cohort_milestone_id}: ${err}`);
    console.error(err.stack);
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

// Returns latest commit in entire cohort for that milestone
export const getRecentCommitInCohort = async (req, res) => {
  try {
    const { cohort_milestone_id } = req.params;
    const latestCommit = await getLatestCommitInCohort(cohort_milestone_id);
    res.send({ data: latestCommit });
  } catch (err) {
    console.error(err);
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
  numberOfLinesInEachMilestone,
  weeklyCommitActivityData,
  userAndTeamCommitsDayWise,
  moveLearnerToNewGithubTeam,
  deleteGithubRepository,
  removeLearnerFromGithubTeam,
};
