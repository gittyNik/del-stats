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
  updateLearnerChallengeCommits,
  updateLearnerMilestoneCommits,
  updateOneChallengeCommits,
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

/**
 * @api {get} /integrations/github/stats/challenges/user/:repo Update User commits for a repo
 * @apiDescription Update User commits for a repo
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserCommits
 * @apiGroup GithubStats
 *
 * @apiParam {String} repo
 */
router.get('/challenges/user/:repo', updateOneChallengeCommits);

router.get('/commits/cohort/:cohort_milestone_id', getTotalCohortCommits);

router.get('/challenges/user', numberOfAttemptedChallenges);

router.get('/lines/milestones/user/:cohort_id', numberOfLinesInEachMilestone);

router.get('/all/:cohort_id/:cohort_milestone_id', getAllStats);

/**
 * @api {post} /integrations/github/stats/challenges/user Update User commits
 * @apiDescription Update User's challenge commits
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserCommits
 * @apiGroup GithubStats
 *
 * @apiParam {String} cohort_id
 * @apiParam {String} start_date
 * @apiParam {String} end_date
 * @apiParam {String} user_id
 * @apiParam {String} cohort_milestone_id
 */
router.post('/challenges/user', updateLearnerChallengeCommits);

/**
 * @api {post} /integrations/github/stats/milestone/user Update User commits
 * @apiDescription Update User's milestone commits
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserCommits
 * @apiGroup GithubStats
 *
 * @apiParam {String} user_id
 * @apiParam {String} cohort_milestone_id
 */
router.post('/milestone/user', updateLearnerMilestoneCommits);

export default router;
