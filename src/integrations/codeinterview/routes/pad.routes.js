import express from "express";
import { 
	createInterviewEndpoint, 
	getInterviewbyIdEndpoint, 
	getInterviewEndpoint,
	getAllLearnerInterviewsEndpoint 
} from "../controllers";

const router = express.Router();

/**
 * @api {get} / Get interview details
 * @apiDescription Get interview details
 * @apiHeader {String} authorization JWT Token.
 * @apiName getInterview
 * @apiGroup Interview Events
 */
router.get("/", getInterviewEndpoint)

/**
 * @api {get} /:id Get interview details by id
 * @apiDescription Get interview details by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName getInterview
 * @apiGroup Interview Events
 */
router.get("/:id", getInterviewbyIdEndpoint)

/**
 * @api {get} /learner/:learner_id Get interview details by id
 * @apiDescription Get interview details by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName getInterview
 * @apiGroup Interview Events
 */
router.get("/learner/:learner_id", getAllLearnerInterviewsEndpoint)

/**
 * @api {post} / Create a new pad for interview
 * @apiDescription Create a Pad
 * @apiHeader {String} authorization JWT Token.
 * @apiName createInterview
 * @apiGroup Interview Events
 */
router.post("/", createInterviewEndpoint);

export default router;
