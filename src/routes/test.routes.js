/*
GET /api/firewall/tests/               -> list of all generated tests
GET /api/firewall/tests/:id            -> list specific test with id
POST /api/firewall/tests/generate       -> generate a test (coding, logical, mindset)
PATCH /api/firewall/tests/:id          -> update specific test
PATCH /api/firewall/tests/:id/video    -> add screen recording to specific test
PATCH /api/firewall/tests/:id/history  -> add url visited for specific test
*/

import Express from 'express';
import { getAllTest, getOneTest, generateSpecificTest, updateTest, updateVideo, updateBrowsedUrl} from '../controllers/test.controller';

const router = Express.Router();

/**
 * @api {get} /firewall/tests Get all tests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTests
 * @apiGroup Test
 */
router.get('/', getAllTest);

/**
 * @api {get} /firewall/tests/:id Get a tests by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTest
 * @apiGroup Test
 */
router.get('/:id', getOneTest);

router.post('/', generateSpecificTest);

router.patch('/:id', updateTest);
router.patch('/:id/video', updateVideo);
router.patch('/:id/history', updateBrowsedUrl);

export default router;
