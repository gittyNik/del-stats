import Express from 'express';
import { getRecentCommit, getRecentCommitInCohort } from '../../../integrations/github/controllers';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.get('/latestUserCommitOnRepository/:username/:repo_name', getRecentCommit);

// Returns latest commit in entire cohort for that milestone
router.get('/latestCommitInCohort/:cohort_milestone_id', getRecentCommitInCohort);

export default router;



