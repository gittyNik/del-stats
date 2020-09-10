import Express from 'express';
import {
  getAllBreakoutTemplatesAPI,
  getBreakoutTemplateByIdAPI,
  createBreakoutTemplateAPI,
  updateBreakoutTemplateAPI,
  deleteBreakoutTemplateAPI,
} from '../../controllers/learning/breakout_template.controller';

import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/breakouts/templates Get all Content Breakouts templates
 * @apiDescription get all Content Breakouts templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutTemplates
 * @apiParam {skip} skip number of records
 * @apiParam {limit} limit number of records
 * @apiParam {sort_by} sort_by values - [likes, views, created_at]
 */
router.get('/', getAllBreakoutTemplatesAPI);

/**
 * @api {get} /learning/content/breakouts/templates/:id Get all Content Breakouts templates
 * @apiDescription get all Content Breakouts templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 */
router.get('/:id', getBreakoutTemplateByIdAPI);

router.use(allowMultipleRoles([ADMIN]));

/**
 * @api {post} /learning/content/breakouts/templates/ Insert Breakout recording
 * @apiDescription get all Content Breakouts templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutTemplates
 * @apiParam {name} Name of breakout template
 * @apiParam {topic_id} Topic id array
 * @apiParam {mandatory} Boolean
 * @apiParam {level} level of breakout beginner, advance
 * @apiParam {primary_catalyst} Primary Catalyst
 * @apiParam {secondary_catalysts} All Catalyst
 * @apiParam {details} Details for Breakout
 * @apiParam {duration} time in milliseconds
 * @apiParam {time_scheduled} scheduled time
 * @apiParam {after_days} after days of milestone start
 * @apiParam {updated_by} Update by
 * @apiParam {cohort_duration} cohort duration for part-time/full-time
 * @apiParam {program_id} Program name
 */
router.post('/', createBreakoutTemplateAPI);

/**
 * @api {patch} /learning/content/breakouts/templates/:id Update Breakout recording
 * @apiDescription get all Content Breakouts templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutTemplates
  * @apiParam {name} Name of breakout template
 * @apiParam {topic_id} Topic id array
 * @apiParam {mandatory} Boolean
 * @apiParam {level} level of breakout beginner, advance
 * @apiParam {primary_catalyst} Primary Catalyst
 * @apiParam {secondary_catalysts} All Catalyst
 * @apiParam {details} Details for Breakout
 * @apiParam {duration} time in milliseconds
 * @apiParam {time_scheduled} scheduled time
 * @apiParam {after_days} after days of milestone start
 * @apiParam {updated_by} Update by
 * @apiParam {cohort_duration} cohort duration for part-time/full-time
 * @apiParam {program_id} Program name
 */
router.patch('/:id', updateBreakoutTemplateAPI);

/**
 * @api {delete} /learning/content/breakouts/templates/:id Delete Template
 * @apiDescription Delete a Content Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteTemplate
 * @apiGroup Template
 */
router.delete('/:id', deleteBreakoutTemplateAPI);

export default router;
