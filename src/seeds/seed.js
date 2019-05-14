/*

  The seeds will add the following seed data for the development environment!
  - Users
    - 1 Super admin
    - Few Educators
  - Several Pings
  - Several Prompts
    - Assign some pings
  - Few Cohorts
    - Few Students
    - Several days
      - Create spotters
      - Timeline (An array of prompts)
        - Create pingpongs foreach event

*/
import {createSuperAdmin} from './users';
import {createPings} from './pings';
import {createPrompt, populatePrompt} from './prompts';
import {createCohort, populateCohort} from './cohorts';

const pingCount = 100,
  promptCount = 40,
  cohorCount = 3,
  studentCount = 20,  // for each cohort
  dayCount = 108;

export default async c => {

  // Create a super admin user
  await createSuperAdmin();

  // Create pings
  await createPings(pingCount);

  // Create prompts & assign pings
  for (var i = 0; i < promptCount; i++) {
    let prompt = await createPrompt();
    await populatePrompt(prompt);
  }

  // Create cohorts & create days for each cohort
  for (var i = 0; i < cohorCount; i++) {
    let cohort = await createCohort();
    await populateCohort({cohort, studentCount, dayCount});
  }
}
