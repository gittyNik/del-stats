import Express from 'express';
import { getTotalTeamAndUserCommits, getTotalUserCommitsPastWeek } from '../../../integrations/github/controllers';

const router = Express.Router();

// router.get('/team/commits', getTotalTeamCommits);

// router.get('/user/commits', getTotalUserCommits);

router.get('/user/commits/week/:milestone_repo_name', getTotalUserCommitsPastWeek);

router.get('/team/user/commits/:milestone_repo_name', getTotalTeamAndUserCommits);

export default router;