import Express from 'express';
import {
  numberOfLinesInEachMilestone,
  getTotalTeamAndUserCommits,
  getTotalUserCommitsPastWeek,
  numberOfAttemptedChallenges,
  getTotalCohortCommits,
  getAllStats,
  getRecentCommit,
  fillGithubStats,
  fillGithubChallengesStats,
  // userAndTeamCommitsDayWise
} from '../../../integrations/github/controllers';

import {
  allowMultipleRoles,
} from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';

const {
  ADMIN, LEARNER, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, LEARNER, OPERATIONS]));

// router.get('/team/commits', getTotalTeamCommits);

// router.get('/user/commits', getTotalUserCommits);

router.get('/commits/recent', getRecentCommit);

router.get('/commits/filldata', fillGithubStats);

router.get('/commits/fillchallenges', fillGithubChallengesStats);

router.get(
  '/commits/user/week/:milestone_repo_name',
  getTotalUserCommitsPastWeek,
);

router.get(
  '/commits/team/user/:milestone_repo_name',
  getTotalTeamAndUserCommits,
);

router.get('/commits/cohort/:cohort_milestone_id', getTotalCohortCommits);

router.get('/challenges/user', numberOfAttemptedChallenges);

router.get('/lines/milestones/user/:cohort_id', numberOfLinesInEachMilestone);

router.get('/all/:cohort_id/:cohort_milestone_id', getAllStats);

export default router;
