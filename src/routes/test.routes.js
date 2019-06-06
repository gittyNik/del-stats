/*
GET /api/firewall/tests/               -> list of all generated tests
GET /api/firewall/tests/:id            -> list specific test with id
GET /api/firewall/tests/:type/generate -> generate test (coding, logical, mindset etc)
PATCH /api/firewall/tests/:id          -> update specific test
PATCH /api/firewall/tests/:id/video    -> add screen recording to specific test
PATCH /api/firewall/tests/:id/history  -> add url visited for specific test
*/

import Express from 'express';
import { getAllTest, getOneTest, generateSpecificTest, updateTest, updateVideo, updateBrowsedUrl} from '../controllers/test.controller';

const router = Express.Router();

router.get('/', getAllTest);
router.get('/:id', getOneTest);
router.get('/:type/generate', generateSpecificTest);

router.patch('/:id', updateTest);
router.patch('/:id/video', updateVideo);
router.patch('/:id/history', updateBrowsedUrl);

export default router;
