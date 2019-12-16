import Express from 'express';
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram} from '../../controllers/learning/program.controller';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /programs Get all Programs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPrograms
 * @apiGroup Program
 */
router.get('/', getPrograms);

/**
 * @api {get} /programs/:id Get a Program by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetProgram
 * @apiGroup Program
 */
router.get('/:id', getProgram);

/**
 * @api {post} /programs Create a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateProgram
 * @apiGroup Program
 * 
 * @apiParam {String} name Name of the program
 * @apiParam {String} location Location of the program
 * @apiParam {String[]} milestones List of Milestone Id's
 * @apiParam {Number} duration Duration interms of number of weeks
 * @apiParam {Object} test_series Test Series
 * @apiParam {Object} milestone_review_rubric Milestone Review by Rubric
 */
router.post('/', createProgram);

/**
 * @api {patch} /programs/:id Update a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateProgram
 * @apiGroup Program
 * 
 * @apiParam {String} name Name of the program
 * @apiParam {String} location Location of the program
 * @apiParam {String[]} milestones List of Milestone Id's
 * @apiParam {Number} duration Duration interms of number of weeks
 * @apiParam {Object} test_series Test Series
 * @apiParam {Object} milestone_review_rubric Milestone Review by Rubric
 */
router.patch('/:id', updateProgram);

/**
 * @api {delete} /programs/:id Delete a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteProgram
 * @apiGroup Program
 */
router.delete('/:id', deleteProgram);

export default router;
