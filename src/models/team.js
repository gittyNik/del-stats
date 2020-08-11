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

const createFullStackTeams = (frontendLearners, backendLearners) => {
  let teams = [];
  let current = [];
  while (frontendLearners.length > 0 && backendLearners.length > 0) {
    if (current.length === 2) {
      const f = allFrontend(current);
      const b = allBackend(current);

      if (f && !b) {
        current.push({ id: backendLearners.pop(), stack: 'f' })
      } else if (b && !f) {
        current.push({ id: frontendLearners.pop(), stack: 'b' })
      }
    }
    if (current.length === 3) {
      teams.push(current);
      current = [];
    }
    if (frontendLearners.length > backendLearners.length) {
      current.push({ id: frontendLearners.pop(), stack: 'f' })
    } else {
      current.push({ id: backendLearners.pop(), stack: 'b' })
    }
  }




  teams = teams.map(team => team.map(member => member.id));

  current = current.map(member => member.id);

  if (frontendLearners.length !== 0) {
    current = current.concat(frontendLearners)
  } else if (!backendLearners.length !== 0) {
    current = current.concat(backendLearners)
  }

  current = splitTeams(current)

  teams = teams.concat(current)

  return teams;
};



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


export const splitFrontEndAndBackEnd = milestone => async mL =>{
  let m = [], teams = [];
  
  // Fetch cohort milestone data

  let data = await getDataForMilestoneName(milestone.id);
  
  // Fetch attendance of last 5 breakouts for cohort learners
  let attendanceList = await Promise.all (mL.map (learner_id => db.query(
    `select attendance from learner_breakouts where id in (select l.id from learner_breakouts as l left join cohort_breakouts as c on l.cohort_breakout_id=c.id where l.learner_id in (\'${learner_id}\') and c.cohort_id=\'${data.cohort.id}\' and c.time_scheduled<=\'${new Date(new Date()).toUTCString()}\' and l.review_feedback is null) limit 5`,
  ).then(a => a[0]).then(a => a.map(b => b.attendance))));
  console.log(attendanceList, attendanceList[0])
  let active = [], inactive = [];

  // Segregate active learners from inactive learners based on their attendance
  attendanceList = attendanceList.map ((att, i) => {
    let at = false;
    att.map (a => {
      if (a) {
        at = true;
      }
    })
    if  (at) {
      active.push (mL[i]);
    } else {
      inactive.push (mL[i]);
    }
  });
  
  teams.push (active);
  teams.push (inactive);

  // Creating teams separately
  teams = await Promise.all(teams.map(async mL => {
    let teams=[];
    m = await Promise.all(mL.map(async id => getProfile(id)));
  
    
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
    
    // Checking whether paths have been assigned or not
    if (m[0].status.includes ('frontend') || m[0].status.includes ('backend')) {
      let frontendUsers = [];
      let backendUsers = [];
      m.map(ms => {
        if (ms.status.includes ('frontend')) {
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
      let repo;
      if (!existingRepo) {
        repo = await createGithubRepositoryFromTemplate(starter_repo, msName);
        msName = repo.name;
      }
      // if (!existingRepo) {
      //   await createGithubRepositoryFromTemplate(starter_repo, msName);
      // } else {
      //   repo = existingRepo;
      // }
      
      await Promise.all(team.map(async member => {
        let u = await getGithubConnecionByUserId(member);
        if (u) {
          u = u.username;
          try {
            await addCollaboratorToRepository(u, repo.name);
          } catch (err) {
            console.warn(`Unable to give user access: ${u}`);
          }
        }
  
        // return {id: user, username: u.username}
  
      }));
  
      // Add Read-access to Reviewers
      await addTeamAccessToRepo('reviewer', msName);
      
      return { team, repo: msName };
    }));
    return teams;
  }));

  // Concatenating active and inactive teams
  teams = teams[0].concat (teams[1]);
  return teams;
}


const findTeamsByCohortMilestoneId = cohort_milestone_id => Team.findAll(
  {
    where: {
      cohort_milestone_id,
    },
  },
  { raw: true },
);

export const createMilestoneTeams = milestone => findTeamsByCohortMilestoneId(
  milestone.milestone_id,
).then(teams => {
  if (teams.length !== 0) {
    return teams;
  }
  console.log(milestone, milestone.milestone_id)
  return CohortMilestone.findByPk(milestone.id)
       .then(m => m.getUsers())
       .then(splitFrontEndAndBackEnd(milestone))
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
