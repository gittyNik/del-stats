import Express from 'express';
import {
  getAllPingTemplates, createPingTemplate, updatePingTemplate, deletePingTemplate,
} from '../../controllers/learning/ping_template.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/templates Get all Nudge Templates
 * @apiDescription get all Nudge Templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgeTemplates
 * @apiGroup NudgeTemplates
 */
router.get('/', getAllPingTemplates);

/**
 * @api {post} /learning/nudge/templates/ Add Nudge Template
 * @apiDescription Add a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgeTemplate
 * @apiGroup NudgeTemplate
 *
 * @apiParam {String} text Text for the Ping Template
 * @apiParam {String} details Details for the Ping Template
 * @apiParam {String} author_id Id of the author of ping
 * @apiParam {String} response_format Response Format
 * @apiParam {String} domain Domain of the ping template
 *
 */
router.post('/', createPingTemplate);

/**
 * @api {patch} /learning/nudge/templates/:id  Update Nudge Templates
 * @apiDescription Update a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgeTemplate
 * @apiGroup NudgeTemplate
 *
 * @apiParam {String} text Text for the Ping Template
 * @apiParam {String} details Details for the Ping Template
 * @apiParam {String} author_id Id of the author of ping
 * @apiParam {String} response_format Response Format
 * @apiParam {String} domain Domain of the ping template
 */
router.patch('/:id', updatePingTemplate);

/**
 * @api {delete} /learning/nudge/templates/:id Delete Nudge Templates
 * @apiDescription Delete a Nudge Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgeTemplate
 * @apiGroup NudgeTemplate
 */
router.delete('/:id', deletePingTemplate);

export default router;
