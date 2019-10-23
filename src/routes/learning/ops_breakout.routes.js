import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ops/breakouts Get all Breakouts attended by learnes
 * @apiDescription get all Breakouts attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/', apiNotReady);

/**
 * @api {get} /learning/ops/breakouts/upcoming Get all upcoming Breakouts
 * @apiDescription get all upcoming Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/upcoming', apiNotReady);

/**
 * @api {post} /learning/ops/breakouts Submit a Breakout
 * @apiDescription Submit a Breakout that the learner has attended
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddBreakout
 * @apiGroup Breakout
 */
router.post('/', apiNotReady);

export default router;
