import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();
/**
 * @api {get} /career/jobs Get all jobs
 * @apiDescription get all jobs
 * @apiHeader {String} authorization JWT Token.
 * @apiName Getjobs
 * @apiGroup JobPosting
 */
router.get('/', apiNotReady);

/**
 * @api {get} /career/jobs/live Get live jobs
 * @apiDescription get live jobs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLivejobs
 * @apiGroup JobPosting
 */
router.get('/live', apiNotReady);

/**
 * @api {get} /career/jobs/latest Get latest jobs
 * @apiDescription get latest jobs
 * @apiHeader {String} authorization JWT Token.
 * @apiName getLatestjob
 * @apiGroup JobPosting
 */
router.get('/latest', apiNotReady);

/**
 * @api {get} /career/jobs/top Get top jobs
 * @apiDescription get top jobs
 * @apiHeader {String} authorization JWT Token.
 * @apiName getTopjobs
 * @apiGroup JobPosting
 */
router.get('/top', apiNotReady);

/**
 * @api {get} /career/jobs/user/:id Get jobs by UserId
 * @apiDescription get all jobs by user id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetjobsByUserId
 * @apiGroup JobPosting
 */
router.get('/user/:id', apiNotReady);

/**
 * @api {get} /career/jobs/:id Get an job
 * @apiDescription get an job
 * @apiHeader {String} authorization JWT Token.
 * @apiName Getjob
 * @apiGroup JobPosting
 */
router.get('/:id', apiNotReady);

/**
 * @api {post} /career/jobs/ Add job
 * @apiDescription Add an job
 * @apiHeader {String} authorization JWT Token.
 * @apiName Addjob
 * @apiGroup JobPosting
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /career/jobs/:id  Update job
 * @apiDescription Update an job
 * @apiHeader {String} authorization JWT Token.
 * @apiName Updatejob
 * @apiGroup JobPosting
 */
router.patch('/:id', apiNotReady);

/**
 * @api {patch} /career/jobs/:id/review Submit review of job
 * @apiDescription Review an job
 * @apiHeader {String} authorization JWT Token.
 * @apiName Reviewjob
 * @apiGroup JobPosting
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /career/jobs/:id Delete job
 * @apiDescription Delete an job
 * @apiHeader {String} authorization JWT Token.
 * @apiName Deletejob
 * @apiGroup JobPosting
 */
router.delete('/:id', apiNotReady);

export default router;
