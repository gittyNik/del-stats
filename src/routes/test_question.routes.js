/*
GET /api/firewall/test_questions        -> get all questions
POST /api/firewall/test_questions       -> add a question
DELETE /api/firewall/test_questions/:id -> delete a question
PATCH /api/firewall/test_questions/:id  -> update a question
*/

import Express from 'express';
import { getAllQuestion, addQuestion, deleteQuestion, updateQuestion} from '../controllers/test_question.controller';

const router = Express.Router();

router.get('/', getAllQuestion);
router.post('/', addQuestion);
router.delete('/', deleteQuestion);
router.patch('/', updateQuestion);

export default router;
