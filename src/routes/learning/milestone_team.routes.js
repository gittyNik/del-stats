import Express from 'express';
import { getTeam} from '../../controllers/learning/milestone.controller';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/milestones/:milestone_id/teams Get milestone teams
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeams
 * @apiGroup MilestoneTeam
 */
router.get('/teams', apiNotReady);

/**
 * @api {get} /learning/milestones/:milestone_id/team Get team details
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeam
 * @apiGroup MilestoneTeam
 */
router.get('/teams/:id', getTeam);

/**
 * @api {patch} /learning/milestones/:milestone_id/teams Reset Milestone Teams
 * @apiHeader {String} authorization JWT Token.
 * @apiName Reset the milestone teams
 * @apiGroup MilestoneTeam
 */
router.patch('/teams', apiNotReady);

export default router;
