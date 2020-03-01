import Express from 'express';
import { getTotalTeamAndUserCommits, getTotalUserCommitsPastWeek, numberOfAttemptedChallenges, getTotalCohortCommits } from '../../../integrations/github/controllers';

const router = Express.Router();

// router.get('/team/commits', getTotalTeamCommits);

// router.get('/user/commits', getTotalUserCommits);

router.get('/commits/user/week/:milestone_repo_name', getTotalUserCommitsPastWeek);

router.get('/commits/team/user/:milestone_repo_name', getTotalTeamAndUserCommits);

router.get('/commits/cohort/:cohort_milestone_id', getTotalCohortCommits);

router.get('/challenges/user', numberOfAttemptedChallenges)

export default router;