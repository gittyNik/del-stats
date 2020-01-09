import { generateMilestoneTeams } from './team';
import database from '../database';

// Connection should be closed everytime models are used
afterAll(() => database.close());

// todo: ensure tagged resources exists first
it('should create teams for a milestone', () => {
  const cohort_milestone_id = '';
  return generateMilestoneTeams(cohort_milestone_id)
  .then(teams => {
    console.log(teams);
    expect(teams).toBeDefined();
  });
});
