import express from "express";
import { createInterviewEndpoint } from "../controllers";

const router = express.Router();

/**
 * @api {post} / Create a new pad for interview
 * @apiDescription Create a Pad
 * @apiHeader {String} authorization JWT Token.
 * @apiName createInterview
 * @apiGroup Interview Events
 */
router.post("/", createInterviewEndpoint);

export default router;
