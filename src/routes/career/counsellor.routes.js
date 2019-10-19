import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /career/counsellors Get all Career Counsellors
 * @apiDescription get all Career Counsellors
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCareerCounsellors
 * @apiGroup CareerCounsellor
 */
router.get('/', apiNotReady);

/**
 * @api {post} /career/counsellors/ Add Career Counsellor
 * @apiDescription Add an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCareerCounsellor
 * @apiGroup CareerCounsellor
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /career/counsellors/:id  Update Career Counsellor
 * @apiDescription Update an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCareerCounsellor
 * @apiGroup CareerCounsellor
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /career/counsellors/:id Delete Career Counsellor
 * @apiDescription Delete an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteCareerCounsellor
 * @apiGroup CareerCounsellor
 */
router.delete('/:id', apiNotReady);

export default router;
