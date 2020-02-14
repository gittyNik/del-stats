import Express from 'express';
import { getRecentCommit } from '../../../integrations/github/controllers';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.get('/latestUserCommitOnRepository/:username/:repo_name', getRecentCommit);


// router.get('/latestCommitInCohort/:cohort_milestone_id', getRecentCommitInCohort);

export default router;



