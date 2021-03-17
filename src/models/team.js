import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import faker from 'faker';
import db from '../database';
import {
  CohortMilestone,
  getDataForMilestoneName,
  getCurrentCohortMilestone,
} from './cohort_milestone';
import { getProfile } from './user';
import {
  toSentenceCase,
  addCollaboratorToRepository,
  removeCollaboratorFromRepository,
  createGithubRepositoryFromTemplate,
} from '../integrations/github/controllers';
import {
  addTeamAccessToRepo,
  isExistingRepository,
} from '../integrations/github/controllers/repository.controller';
import { getGithubConnecionByUserId } from './social_connection';
import {
  lastNBreakoutsForLearner,
} from '../controllers/operations/attendance.controller';
import logger from '../util/logger';
import {
  deleteLearnerTeams,
} from './learner_github_milestones';

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

export const deleteTeamById = id => Team.destroy({
  where: {
    id,
  },
});

export const getLearnerTeam = (
  cohort_milestone_id, learner_id,
) => Team.findOne({
  where: {
    cohort_milestone_id,
    learners: { [Sequelize.Op.contains]: [learner_id] },
  },
  raw: true,
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

export const getLeastAttendingLearners = (
  learners, threshold = 5,
) => Promise.all(learners.map(id => {
  let last5Breakouts = lastNBreakoutsForLearner(id, threshold);
  return last5Breakouts.filter(({ attendance }) => attendance === false);
}));

export const belowThresholdLearners = async (learners, threshold) => {
  let absentLearners = await getLeastAttendingLearners(learners, threshold);
  let reduceLearner = absentLearners.reduce((a, b) => {
    a.push(a.length + b.length); return a;
  }, []);
  let active_learners = [];
  let inactive_learners = [];
  reduceLearner.forEach((eachLearner, learnerIndex) => {
    if (eachLearner > 3) {
      inactive_learners.push(learners[learnerIndex]);
    } else {
      active_learners.push(learners[learnerIndex]);
    }
  });
  return { active_learners, inactive_learners };
};

export const splitFrontEndAndBackEnd = cohort_milestone_id => async learnerIds => {
  let activelearnersProfile = [];
  let inactivelearnersProfile = [];
  let teams = [];

  // Separate Active and In-active learners if count of learners > 4,
  // Inactive having more than 4 last attended breakouts as false
  if (learnerIds.length > 4) {
    let allLearners = await belowThresholdLearners(learnerIds);
    let { active_learners, inactive_learners } = allLearners;
    // if only 1 or 2 active learners, add them to teams with inactive
    if (active_learners.length < 3) {
      active_learners = [...active_learners, ...inactive_learners];
      inactive_learners = [];
    }
    activelearnersProfile = await Promise.all(active_learners.map(id => getProfile(id)));
    inactivelearnersProfile = await Promise.all(inactive_learners.map(id => getProfile(id)));
  } else {
    activelearnersProfile = await Promise.all(learnerIds.map(id => getProfile(id)));
  }
  let data = await getDataForMilestoneName(cohort_milestone_id);
  let baseMilestoneName = `MS_${toSentenceCase(
    data.milestone.name,
  )}_${toSentenceCase(data.cohort.name)}_${toSentenceCase(
    data.cohort.program_id,
  )}_${toSentenceCase(
    data.cohort.location,
  )}_${toSentenceCase(
    data.cohort.duration === 16
      ? 'Full-Time'
      : 'Part-Time',
  )}_${new Date(data.cohort.start_date).getFullYear()}`;
  let { starter_repo } = data.milestone;

  // let learnerBreakouts = [];
  // Create Teams for active Learners
  if (activelearnersProfile.length > 0) {
    if (activelearnersProfile[0].status.includes('frontend')
      || activelearnersProfile[0].status.includes('backend')) {
      let activefrontendUsers = [];
      let activebackendUsers = [];
      activelearnersProfile.map(ms => {
        if (ms.status.includes('frontend')) {
          activefrontendUsers.push(ms.id);
        } else {
          activebackendUsers.push(ms.id);
        }
      });

      // Add FE learner + Backend Breakout creation
      // learnerBreakouts.push(createLearnerBreakoutsForMilestone(activefrontendUsers,
      //   cohort_milestone_id, 'frontend'));
      // learnerBreakouts.push(createLearnerBreakoutsForMilestone(activebackendUsers,
      //   cohort_milestone_id, 'backend'));
      teams = createFullStackTeams(activefrontendUsers, activebackendUsers);
    } else {
      // Non FE BE learners
      activelearnersProfile = activelearnersProfile.map(ms => ms.id);
      teams = splitTeams(activelearnersProfile);
    }
  }

  // Create Teams for inactive learners
  let inactiveTeams;

  if (inactivelearnersProfile.length > 0) {
    if (inactivelearnersProfile[0].status.includes('frontend')
      || inactivelearnersProfile[0].status.includes('backend')) {
      let frontendUsers = [];
      let backendUsers = [];
      inactivelearnersProfile.map(ms => {
        if (ms.status.includes('frontend')) {
          frontendUsers.push(ms.id);
        } else {
          backendUsers.push(ms.id);
        }
      });

      // Add FE learner + Backend Breakout creation
      // learnerBreakouts.push(createLearnerBreakoutsForMilestone(frontendUsers,
      //   cohort_milestone_id, 'frontend'));
      // learnerBreakouts.push(createLearnerBreakoutsForMilestone(backendUsers,
      //   cohort_milestone_id, 'backend'));
      inactiveTeams = createFullStackTeams(frontendUsers, backendUsers);
      teams.push(...inactiveTeams);
    } else {
      // Non FE BE learners
      inactivelearnersProfile = inactivelearnersProfile.map(ms => ms.id);
      inactiveTeams = splitTeams(inactivelearnersProfile);
      teams.push(...inactiveTeams);
    }
  }
  // Create common breakouts for all
  // learnerBreakouts.push(createLearnerBreakoutsForMilestone(learnerIds, cohort_milestone_id, 'common'));
  // await Promise.all(learnerBreakouts);

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
  // Temp fix so that learners can see Delta
  // Needs to be replaced with a logic checking for Milestones
  // which only require team creation
  try {
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
  } catch (err) {
    logger.error(err);
    return [];
  }
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
  attributes: ['github_repo_link', 'id', 'learners'],
});

export const addLearnerToMSTeam = (user_id, team_id) => Team.findOne({
  where: {
    id: team_id,
  },
})
  .then(team => { team.learners.push(user_id); return team; })
  .then(async team => {
    let sc = await getGithubConnecionByUserId(user_id);
    await addCollaboratorToRepository(sc.username, team.github_repo_link);
    return Team.update({
      learners: team.learners,
    }, {
      where: {
        id: team.id,
      },
    });
  });

export const removeLearnerFromMSTeam = (user_id, team_id) => Team.findOne({
  where: {
    id: team_id,
  },
})
  .then(team => {
    team.learners = team.learners.filter(t => t !== user_id);
    return team;
  })
  .then(async team => {
    let sc = await getGithubConnecionByUserId(user_id);
    await removeCollaboratorFromRepository(sc.username, team.github_repo_link);
    if (team.learners.length === 0) {
      // Delete entry in Github stats if Zero commits and delete team later
      let deletedStats = await deleteLearnerTeams(team.id);
      if (deletedStats.length) {
        return deleteTeamById(team.id);
      }
    }
    return Team.update({
      learners: team.learners,
    }, {
      where: {
        id: team.id,
      },
    });
  });

export const getOneTeamToAddLearner = async (current_cohort_id) => {
  let cohortMilestone = await getCurrentCohortMilestone(current_cohort_id);
  let foundTeam = true;
  let teamId;
  while (foundTeam) {
    let teams = cohortMilestone.milestone_learner_teams;
    if (teams.length > 0) {
      for (let team = 0; team < teams.length; team++) {
        if (teams[team].learners.length < 4) {
          teamId = teams[team].id;
          foundTeam = false;
          break;
        }
      }
    } else {
      console.log('No Team to add learner to');
      foundTeam = false;
    }
  }
  return teamId;
};

export const moveLearnerBetweenMSTeam = (current_team_id, user_id, future_team_id) => Promise.all([
  removeLearnerFromMSTeam(user_id, current_team_id),
  addLearnerToMSTeam(user_id, future_team_id),
]);

export const currentTeamOfLearner = (learner_id, cohort_id) => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findOne({
    where: {
      [Sequelize.Op.and]: [
        { cohort_id },
        {
          release_time: {
            [Sequelize.Op.lte]: now,
          },
        },
        {
          review_scheduled: {
            [Sequelize.Op.gt]: now,
          },
        },
      ],
    },
  }).then(data => data.id)
    .then(cohort_milestone_id => Team.findOne({
      where: {
        cohort_milestone_id,
        learners: {
          [Sequelize.Op.contains]: [learner_id],
        },
      },
    }));
};
