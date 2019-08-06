import Express from 'express';
import applicationRouter from './application.routes';
import testRouter from './test.routes';
import testQuestionRouter from './test_question.routes';
import getPublicStats from '../controllers/firewall.controller';
import authenticate from '../controllers/auth.controller';

const router = Express.Router();
// Public routes
/**
 * @api {get} /firewall/stats Get firewall public stats
 * @apiDescription Get firewall public stats like total applications etc
 * @apiName GetFirewallStats
 * @apiGroup Firewall
 */
router.get('/stats', getPublicStats);
// Private routes
router.use(authenticate);
router.use('/applications', applicationRouter);
router.use('/tests', testRouter);
router.use('/test_questions', testQuestionRouter);

export default router;
