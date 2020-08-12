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
import {
  addTeamAccessToRepo,
  isExistingRepository,
} from '../integrations/github/controllers/repository.controller';
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

const allFrontend = (current) => {
  if (current[0].stack !== current[1].stack) {
    return false;
  }
  if (current[0].stack === 'f') {
    return true;
  }
  return false;
};

const allBackend = (current) => {
  if (current[0].stack !== current[1].stack) {
    return false;
  }
  if (current[0].stack === 'b') {
    return true;
  }
  return false;
};

export const splitTeams = users => {
  const teams = [];
  const shuffled = _.shuffle(users);

  while (shuffled.length > 4) {
    teams.push(shuffled.splice(-3));
  }

  if (shuffled.length > 0) teams.push(shuffled);

  return teams;
};

const createFullStackTeams = (frontendLearners, backendLearners) => {
  let teams = [];
  let current = [];
  while (frontendLearners.length > 0 && backendLearners.length > 0) {
    if (current.length === 2) {
      const f = allFrontend(current);
      const b = allBackend(current);

      if (f && !b) {
        current.push({ id: backendLearners.pop(), stack: 'f' });
      } else if (b && !f) {
        current.push({ id: frontendLearners.pop(), stack: 'b' });
      }
    }
    if (current.length === 3) {
      teams.push(current);
      current = [];
    }
    if (frontendLearners.length > backendLearners.length) {
      current.push({ id: frontendLearners.pop(), stack: 'f' });
    } else {
      current.push({ id: backendLearners.pop(), stack: 'b' });
    }
  }

  teams = teams.map(team => team.map(member => member.id));

  current = current.map(member => member.id);

  if (frontendLearners.length !== 0) {
    current = current.concat(frontendLearners);
  } else if (!backendLearners.length !== 0) {
    current = current.concat(backendLearners);
  }

  current = splitTeams(current);

  teams = teams.concat(current);

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
  let m = []; let
    teams = [];

  m = await Promise.all(mL.map(id => getProfile(id)));

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

  if (m[0].status.includes('frontend') || m[0].status.includes('backend')) {
    let frontendUsers = [];
    let backendUsers = [];
    m.map(ms => {
      if (ms.status.includes('frontend')) {
        frontendUsers.push(ms.id);
      } else {
        backendUsers.push(ms.id);
      }
    });

    teams = createFullStackTeams(frontendUsers, backendUsers);
  } else {
    m = m.map(ms => ms.id);
    teams = splitTeams(m);
  }

  teams = await Promise.all(teams.map(async (team, i) => {
    let msName = `${baseMilestoneName}_${i + 1}`;
    msName = toGithubFormat(msName);
    let existingRepo = await isExistingRepository(msName);
    if (!existingRepo) {
      await createGithubRepositoryFromTemplate(starter_repo, msName);
    }
    await Promise.all(team.map(async member => {
      let u = await getGithubConnecionByUserId(member);
      if (u) {
        u = u.username;
        try {
          await addCollaboratorToRepository(u, msName);
        } catch (err) {
          console.warn(`Unable to give user access: ${u}\n${err}`);
        }
      }

      // return {id: user, username: u.username}
    }));

    // Add Read-access to Reviewers
    await addTeamAccessToRepo('reviewer', msName);

    return { team, repo: msName };
  }));
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

export const getLearnerMilestoneTeam = (user_id, cohort_milestone_id) => Team.findOne({
  where: {
    learners: {
      [Sequelize.Op.contains]: [user_id],
    },
    cohort_milestone_id,
  },
  attributes: ['github_repo_link', 'id'],
});
