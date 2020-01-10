import { generateMilestoneTeams } from './team';
import { getCurrentCohortMilestones } from './cohort_milestone';
import database from '../database';

// Connection should be closed everytime models are used
afterAll(() => database.close());

// todo: ensure tagged resources exists first
it('should create teams for a milestone', () => {
  return getCurrentCohortMilestones()
    .then(milestones => {
      if(milestones[0]){
        return generateMilestoneTeams(milestones[0].id)
          .then(teams => {
            expect(Array.isArray(teams)).toBeTruthy();
            if(teams.length > 0) {
              expect(Array.isArray(teams[0])).toBeTruthy();
            }
          });
      }
    });
});
