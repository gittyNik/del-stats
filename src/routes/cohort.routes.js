import Express from 'express';
import { getCohortDays, createCohortDays } from '../controllers/day.controller';
import { getCohortByName, getCohorts, getCohort, createCohort, updateCohort, deleteCohort, resetSpotters } from '../controllers/cohort.controller';
import { allowSuperAdminOnly } from '../controllers/roles.controller';

const router = Express.Router();


/**
 * @api {get} /cohorts Get all cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohorts
 * @apiGroup Cohort
 */
router.get('/', getCohorts);
router.get('/:cohortName', getCohortByName);
router.get('/id/:id', getCohort);
router.post('/', createCohort);
router.patch('/:id', updateCohort);
router.delete('/:id', deleteCohort);

router.get('/:cohort_id/days', getCohortDays);
/**
 * @api {post} /cohorts/:cohort_id/days Add days to an existing cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName ExtendCohort
 * @apiGroup Cohort
 *
 * @apiParam {String} count Number of days to be added to the cohort.
 */
router.post('/:cohort_id/days', createCohortDays);

router.patch('/:cohort_id/spotters/reset', allowSuperAdminOnly, resetSpotters);

export default router;
