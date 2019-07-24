import Express from 'express';
import {getAllTests, getTestById, updateTest, getTestByApplicationId,
  updateVideo, updateBrowsedUrl} from '../controllers/test.controller';

const router = Express.Router();

/**
 * @api {get} /firewall/tests Get all Tests
 * @apiDescription get all tests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTests
 * @apiGroup Test
 */
router.get('/', getAllTests);

/**
 * @api {get} /firewall/tests/application/:id Get Test by ApplicationId
 * @apiDescription get a test by ApplicationId
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTestByApplicationId
 * @apiGroup Test
 */
router.get('/application/:id', getTestByApplicationId);

/**
 * @api {get} /firewall/tests/:id Get Test by id
 * @apiDescription get a test by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTest
 * @apiGroup Test
 */
router.get('/:id', getTestById);

/**
 * @api {patch} /firewall/tests/:id Update a Test
 * @apiDescription Update a test
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTest
 * @apiGroup Test
 * 
 * @apiParam {String} sub_time Time at which test is submitted
 */
router.patch('/:id', updateTest);

/**
 * @api {patch} /firewall/tests/:id/video Update RecordedScreen
 * @apiDescription Update RecordedScreen of a test
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateRecordedScreen
 * @apiGroup Test
 */
router.patch('/:id/video', updateVideo);

/**
 * @api {patch} /firewall/tests/:id/history Update BrowsedUrls
 * @apiDescription Update BrowsedUrls of a test
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateBrowsedUrls of a testTest
 * @apiGroup Test
 *
 * @apiParam {json} browsedUrls BrowsedUrls details {"urls":[]}
 */
router.patch('/:id/history', updateBrowsedUrl);

export default router;
