import Sequelize from 'sequelize';
import { splitTeams, createMilestoneTeams, Team } from './team';
import { getCurrentCohortMilestones } from './cohort_milestone';
import database from '../database';

let cohortMilestone, originalTeams = [];
beforeAll(() => {
  return getCurrentCohortMilestones()
    .then(milestones => {
      cohortMilestone = milestones[0];
      if(cohortMilestone) {
        return Team.findAll({where: {
          cohort_milestone_id: cohortMilestone.id
        }})
          .then(teams => {
            originalTeams = teams.map(t => t.id);
          });
      }
    });
});

// Connection should be closed everytime models are used
afterAll(() => {
  return Team.destroy({where: {
    cohort_milestone_id: cohortMilestone.id,
    id: {
      [Sequelize.Op.notIn]: originalTeams
    }
  }})
    .then(() => database.close());
});

// todo: ensure tagged resources exists first
it('should generate teams for a milestone', () => {
  if(cohortMilestone){
    return cohortMilestone.getUsers()
      .then(splitTeams)
      .then(teams => {
        expect(Array.isArray(teams)).toBeTruthy();
        if(teams.length > 0) {
          expect(Array.isArray(teams[0])).toBeTruthy();
        }
      });
  }
  console.log('skipped the test');
});

it('should create teams for a milestone', () => {
  if(cohortMilestone) {
    return createMilestoneTeams(cohortMilestone.id)
      .then(teams => {
        expect(teams.length).toBeTruthy();
      })
  }
  console.log('skipped the test');
});
