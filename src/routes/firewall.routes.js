import Express from 'express';
import application from './application.routes';
import test from './test.routes';
import test_question from './test_question.routes';

const router = Express.Router();

router.use('/applications', application);
router.use('/tests', test);
router.use('/test_questions', test_question);

export default router;



