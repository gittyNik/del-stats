import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /programs Get all Programs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPrograms
 * @apiGroup Program
 */
router.get('/', apiNotReady);

/**
 * @api {get} /programs/:id Get a Program by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetProgram
 * @apiGroup Program
 */
router.get('/:id', apiNotReady);

/**
 * @api {post} /programs Create a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateProgram
 * @apiGroup Program
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /programs/:id Update a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateProgram
 * @apiGroup Program
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /programs/:id Delete a Program
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteProgram
 * @apiGroup Program
 */
router.delete('/:id', apiNotReady);

export default router;
