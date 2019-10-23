import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/templates Get all Nudge Templates
 * @apiDescription get all Nudge Templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgeTemplates
 * @apiGroup NudgeTemplates
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/nudge/templates/ Add Nudge Template
 * @apiDescription Add a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgeTemplate
 * @apiGroup NudgeTemplate
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/nudge/templates/:id  Update Nudge Templates
 * @apiDescription Update a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgeTemplate
 * @apiGroup NudgeTemplate
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/nudge/templates/:id Delete Nudge Templates
 * @apiDescription Delete a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgeTemplate
 * @apiGroup NudgeTemplate
 */
router.delete('/:id', apiNotReady);

export default router;
