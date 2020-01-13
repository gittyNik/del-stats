import Express from 'express';
import {
  getAllTests, getTestById, startTest, submitTest, updateTestResponses,
  getTestByApplicationId, updateVideo, updateBrowsedUrl, updateTestScores,
} from '../../controllers/firewall/test.controller';

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
 * @api {patch} /firewall/tests/:id/responses Update Test responses
 * @apiDescription Update test responses: ignores if already submitted
 * submits the test if expired, otherwise, updates responses against the question_id's
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTest
 * @apiGroup Test
 *
 * @apiParam {Object} responses List of responses to be saved
 */
router.patch('/:id/responses', updateTestResponses);
// backward compatibility, TODO: remove this in later releases
router.patch('/:id', updateTestResponses);

/**
 * @api {patch} /firewall/tests/:id/scores Update Test scores
 * @apiDescription Update test scores
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTestScores
 * @apiGroup Test
 *
 * @apiParam {Object} scores List of scores to be saved
 */
router.patch('/:id/scores', updateTestScores);

/**
 * @api {patch} /firewall/tests/:id/start Start a Test
 * @apiDescription Start a test
 * @apiHeader {String} authorization JWT Token.
 * @apiName StartTest
 * @apiGroup Test
 */
router.patch('/:id/start', startTest);

/**
 * @api {patch} /firewall/tests/:id/submit Submit a Test
 * @apiDescription Submit a test
 * @apiHeader {String} authorization JWT Token.
 * @apiName SubmitTest
 * @apiGroup Test
 */
router.patch('/:id/submit', submitTest);

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
 * @apiParam {Object} browsedUrls BrowsedUrls details {"urls":[]}
 */
router.patch('/:id/history', updateBrowsedUrl);

export default router;
