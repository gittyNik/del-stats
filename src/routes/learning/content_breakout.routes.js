import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/breakouts Get all Content Breakouts
 * @apiDescription get all Content Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakouts
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/content/breakouts/ Add Content Breakout
 * @apiDescription Add a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentBreakout
 * @apiGroup ContentBreakout
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/content/breakouts/:id  Update Content Breakout
 * @apiDescription Update a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentBreakout
 * @apiGroup ContentBreakout
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/content/breakouts/:id Delete Content Breakout
 * @apiDescription Delete a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentBreakout
 * @apiGroup ContentBreakout
 */
router.delete('/:id', apiNotReady);

export default router;
