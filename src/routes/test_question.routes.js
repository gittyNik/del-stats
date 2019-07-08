/*
GET /api/firewall/test_questions        -> get all questions
DELETE /api/firewall/test_questions/:id -> delete a question
PATCH /api/firewall/test_questions/:id  -> update a question
*/

import Express from 'express';
import { getAllQuestion, addQuestion, deleteQuestion, updateQuestion} from '../controllers/test_question.controller';

const router = Express.Router();

router.get('/', getAllQuestion);

/**
 * @api {post} /api/firewall/test_questions Add a question
 * @apiDescription Add a question to the question bank needed by Firewall
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddTestQuestion
 * @apiGroup TestQuestion
 *
 * @apiParam {String} type Type of question
 * @apiParam {String} domain Domain of question
 * @apiParam {Object} question Question details {text, image, options[text, image, isCorrect]}
 */
router.post('/', addQuestion);
router.delete('/:id', deleteQuestion);
router.patch('/:id', updateQuestion);

export default router;
