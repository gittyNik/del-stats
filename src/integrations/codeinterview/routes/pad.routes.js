import express from "express";
import { createInterviewEndpoint } from "../controllers";

const router = express.Router();

/**
 * @api {post} /pad Create a new pad for interview
 * @apiDescription Create a Pad
 * @apiHeader {String} authorization JWT Token.
 * @apiName createInterview
 * @apiGroup Interview Events
 */
router.post("/pad", createInterviewEndpoint);

export default router;
