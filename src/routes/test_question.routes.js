import Express from 'express';
import { getAllQuestions, addQuestion, deleteQuestion,
  updateQuestion} from '../controllers/test_question.controller';

const router = Express.Router();
/**
 * @api {get} /firewall/test_questions Get all Questions
 * @apiDescription Get all the questions from Firewall's question bank
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTestQuestions
 * @apiGroup TestQuestion
 */
router.get('/', getAllQuestions);

/**
 * @api {post} /firewall/test_questions Add a Question
 * @apiDescription Add a question to the question bank needed by Firewall
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddTestQuestion
 * @apiGroup TestQuestion
 *
 * @apiParam {String} type {mcq/text/code}
 * @apiParam {String} domain {generic/tech/mindsets}
 * @apiParam {json} question Question details {text, image, options[{text, image, isCorrect}]}
 */
router.post('/', addQuestion);

/**
 * @api {delete} /firewall/test_questions/:id Delete a Question
 * @apiDescription delete a question from Firewall's question bank
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteTestQuestion
 * @apiGroup TestQuestion
 */
router.delete('/:id', deleteQuestion);

/**
 * @api {patch} /firewall/test_questions/:id Update a Question
 * @apiDescription update a question of Firewall's question bank
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTestQuestion
 * @apiGroup TestQuestion
 *
 * @apiParam {String} type {mcq/text/code}
 * @apiParam {String} domain {generic/tech/mindsets}
 * @apiParam {json} question Question details {text, image, options[{text, image, isCorrect}]}
 */
router.patch('/:id', updateQuestion);

export default router;
