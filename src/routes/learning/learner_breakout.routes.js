import Express from "express";
import { createLearnerBreakoutsForLearnersEndpoint } from "../../controllers/learning/learner_breakout.controller";
import {
	allowMultipleRoles,
	allowAdminsOnly,
} from "../../controllers/auth/roles.controller";
import { USER_ROLES } from "../../models/user";

const { ADMIN, EDUCATOR } = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, EDUCATOR]));

/**
 * @api {get} /learning/content/breakouts/cohort Get all Content Breakouts
 * @apiDescription get all Content Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakouts
 */
router.post("/", createLearnerBreakoutsForLearnersEndpoint);

export default router;
