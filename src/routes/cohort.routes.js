import Express from 'express';
import { getCohortByName, getCohorts, getCohort, createCohort, updateCohort, deleteCohort } from '../controllers/cohort.controller';

const router = Express.Router();

/**
 * @api {get} /cohorts Get all cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohorts
 * @apiGroup Cohort
 */
router.get('/', getCohorts);

/**
 * @api {get} /cohorts/:id Get a cohort by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohort
 * @apiGroup Cohort
 */
router.get('/:id', getCohort);

/**
 * @api {get} /cohorts/:year/:cohort_name Get a cohort with name
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohortByName
 * @apiGroup Cohort
 */
router.get('/:year(^[0-9]{4}$)/:cohort_name', getCohortByName);

/**
 * @api {post} /cohorts Create a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateCohort
 * @apiGroup Cohort
 */
router.post('/', createCohort);

/**
 * @api {patch} /cohorts/:id Update a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCohort
 * @apiGroup Cohort
 */
router.patch('/:id', updateCohort);

/**
 * @api {delete} /cohorts/:id Delete a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteCohort
 * @apiGroup Cohort
 */
router.delete('/:id', deleteCohort);

// router.get('/upcoming', getUpcomingCohorts);

export default router;
