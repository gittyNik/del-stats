import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import faker from 'faker';
import moment from 'moment';
import db from '../database';
import { CohortMilestone, getDataForMilestoneName } from './cohort_milestone';
import { getProfile } from './user';
import {
  toSentenceCase,
  addCollaboratorToRepository,
  createGithubRepositoryFromTemplate,
} from '../integrations/github/controllers';
import { getGithubConnecionByUserId } from './social_connection';


const { contains } = Sequelize.Op;

export const Team = db.define('milestone_learner_teams', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  cohort_milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'cohort_milestones', key: 'id' },
  },
  learners: Sequelize.ARRAY(Sequelize.UUID),
  github_repo_link: Sequelize.STRING,
  product_demo_link: Sequelize.STRING,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('now()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('now()'),
  },
});

export const splitTeams = users => {
  const teams = [];
  const shuffled = _.shuffle(users);

  while (shuffled.length > 4) {
    teams.push(shuffled.splice(-3));
  }

  if (shuffled.length > 0) teams.push(shuffled);

  return teams;
};

export const deleteMilestoneTeams = (cohort_milestone_id, keepTeams = []) => Team.destroy({
  where: { cohort_milestone_id },
  id: {
    [Sequelize.Op.notIn]: keepTeams,
  },
});

const toGithubFormat = str => {
  let finalStr = '';
  let cnt = 0;
  while (str.length > 0) {
    let ind = str.indexOf(' ');
    if (cnt === 0) {
      finalStr = str.substring(0, ind);
      str = str.substring(ind + 1);
      cnt++;
    } else if (ind === -1) {
      finalStr = `${finalStr}-${str}`;
      str = '';
    } else {
      finalStr = `${finalStr}-${str.substring(0, ind)}`;
      str = str.substring(ind + 1);
    }
  }
  return finalStr;
};

export const splitFrontEndAndBackEnd = cohort_milestone_id => async mL => {
  let m = [];
  for (let i = 0; i < mL.length; i++) {
    let as = await getProfile(mL[i]);
    m.push(as);
  }
  if (
    m[0].profile !== null
    && m[0].profile.hasOwnProperty('stack')
    && m[0].profile.hasOwnProperty('stack') !== null
  ) {
    let frontendUsers = [];
    let backendUsers = [];
    m.map(ms => {
      if (ms.profile.stack === 'frontend') {
        frontendUsers.push(ms.id);
      } else {
        backendUsers.push(ms.id);
      }
    });
    const frontendTeams = splitTeams(frontendUsers);
    const backendTeams = splitTeams(backendUsers);
    let teams = [];
    frontendTeams.map(t => teams.push(t));
    backendTeams.map(t => teams.push(t));
    let data = await getDataForMilestoneName(cohort_milestone_id);
    let baseMilestoneName = `MS_${toSentenceCase(
      data.milestone.name,
    )}_${toSentenceCase(data.cohort.name)}_${toSentenceCase(
      data.cohort.program_id,
    )}_${toSentenceCase(
      data.cohort.location === 'T-hub, IIIT Hyderabad'
        ? 'Hyderabad'
        : data.cohort.location,
    )}_${new Date(data.cohort.start_date).getFullYear()}`;
    let { starter_repo } = data.milestone;
    for (let i = 0; i < teams.length; i++) {
      let msName = `${baseMilestoneName}_${i + 1}`;
      msName = toGithubFormat(msName);
      let repo = await createGithubRepositoryFromTemplate(starter_repo, msName);
      let team = teams[i];
      for (let j = 0; j < team.length; j++) {
        msName = repo.name;

        let u = await getGithubConnecionByUserId(team[j]);
        if (!u) {
          continue;
        }
        u = u.username;
        let col = await addCollaboratorToRepository(u, repo.name);
        // return {id: user, username: u.username}
      }

      // Section for checking

      // let isRepo = await repositoryPresentOrNot(msName);
      // if (!isRepo) {
      //   let repo = await createGithubRepository(msName);
      //   var team = teams[i];
      //   for (let j = 0; j < team.length; j++) {
      //     msName = repo.data.name;
      //     let u = await getGithubConnecionByUserId(team[j]);
      //     if (!u) {
      //       continue;
      //     }
      //     u = u.username;
      //     let col = await addCollaboratorToRepository(u, repo.data.name);
      //     // return {id: user, username: u.username}
      //   }
      // }
      teams[i] = { team, repo: msName };
    }
    return teams;
  }
  m = m.map(ms => ms.id);
  let data = await getDataForMilestoneName(cohort_milestone_id);
  let baseMilestoneName = `MS_${toSentenceCase(
    data.milestone.name,
  )}_${toSentenceCase(data.cohort.name)}_${toSentenceCase(
    data.cohort.program_id,
  )}_${toSentenceCase(
    data.cohort.location === 'T-hub, IIIT Hyderabad'
      ? 'Hyderabad'
      : data.cohort.location,
  )}_${new Date(data.cohort.start_date).getFullYear()}`;
  let { starter_repo } = data.milestone;
  let teams = splitTeams(m);
  // TODO: change for loop for proper use of await @Nik
  for (let i = 0; i < teams.length; i++) {
    let msName = `${baseMilestoneName}_${i + 1}`;
    msName = toGithubFormat(msName);
    let repo = await createGithubRepositoryFromTemplate(starter_repo, msName);
    let team = teams[i];
    for (let j = 0; j < team.length; j++) {
      // console.log(repo);
      msName = repo.name;
      let u = await getGithubConnecionByUserId(team[j]);
      if (!u) {
        // TODO: Remove continue
        continue;
      }
      u = u.username;
      let col = await addCollaboratorToRepository(u, repo.name);
      // return {id: user, username: u.username}
    }

    // Commented to reduce Github api pinging

    // let isRepo = await repositoryPresentOrNot(msName);
    // if (!isRepo) {
    //   let repo = await createGithubRepository(msName);
    //   var team = teams[i];
    //   for (let j = 0; j < team.length; j++) {
    //     msName = repo.data.name;
    //     let u = await getGithubConnecionByUserId(team[j]);
    //     if (!u) {
    //       continue;
    //     }
    //     u = u.username;
    //     let col = await addCollaboratorToRepository(u, repo.data.name);
    //     // return {id: user, username: u.username}
    //   }
    // }
    teams[i] = { team, repo: msName };
  }
  return teams;
};

const findTeamsByCohortMilestoneId = cohort_milestone_id => Team.findAll(
  {
    where: {
      cohort_milestone_id,
    },
  },
  { raw: true },
);

export const createMilestoneTeams = cohort_milestone_id => findTeamsByCohortMilestoneId(
  cohort_milestone_id,
).then(teams => {
  if (teams.length !== 0) {
    return teams;
  }
  return CohortMilestone.findByPk(cohort_milestone_id)
    .then(m => m.getUsers())
    .then(splitFrontEndAndBackEnd(cohort_milestone_id))
    .then(cteams => Team.bulkCreate(
      cteams.map(({ team, repo }) => ({
        id: uuid(),
        name: faker.commerce.productName(),
        cohort_milestone_id,
        learners: team,
        github_repo_link: repo,
      })),
    ));
});

export const getTeamsbyCohortMilestoneId = cohort_milestone_id => Team.findAll(
  {
    where: { cohort_milestone_id },
  },
  { raw: true },
);

export const getLearnerTeamOfMilestone = (user_id, cohort_milestone_id) => Team.findAll({
  where: {
    [Sequelize.Op.and]: [
      {
        cohort_milestone_id: {
          [Sequelize.Op.in]: cohort_milestone_id,
        },
      },
      {
        learners: {
          [Sequelize.Op.contains]: user_id,
        },
      },
    ],
  },
});

export const getAllLearnerTeamsByUserId = user_id => Team.findAll({
  where: {
    learners: {
      [Sequelize.Op.contains]: [user_id],
    },
  },
});
