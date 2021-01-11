import Express from 'express';
import {
  getAllFaqs,
  getALearnerFaq,
  createAlearnerFaq,
  updateAlearnerFaq,
  toggleHelpful,
  toggleUnhelpful,
  deleteAlearnerFaq,
  getAllFaqsByPlatformEndpoint
} from '../../controllers/learning/learner_faq.controller';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, SUPERADMIN, EDUCATOR
} = USER_ROLES;

const router = Express.Router();

/**
 * @api {get} /faq Get all learner Faqs
 * @apiHeader {String} authorization JWT Token
 * @apiName getAllFaqs
 * @apiGroup Faq
 */
router.get('/', getAllFaqs);

/**
 * @api {get} /faq Get all learner Faqs
 * @apiHeader {String} authorization JWT Token
 * @apiName getAllFaqs
 * @apiGroup Faq
 */
router.get('/platform', getAllFaqsByPlatformEndpoint);

/**
 * @api {get} /faq/:id Get A learner Faqs
 * @apiHeader {String} authorization JWT Token
 * @apiName getALearnerFaq
 * @apiGroup Faq
 */
router.get('/:id', getALearnerFaq);

/**
 * @api {get} /faq/helpful/:id Toggle helpful for learner Faqs
 * @apiHeader {String} authorization JWT Token
 * @apiName toggleHelpful
 * @apiGroup Faq
 */
router.get('/helpful/:id', toggleHelpful);

/**
 * @api {get} /faq/unhelpful/:id Toggle unhelpful for learner Faqs
 * @apiHeader {String} authorization JWT Token
 * @apiName toggleUnhelpful
 * @apiGroup Faq
 */
router.get('/unhelpful/:id', toggleUnhelpful);

router.use(allowMultipleRoles([ADMIN, EDUCATOR, SUPERADMIN]));

/**
 * @api {post} / Create a learner Faq
 * @apiHeader {String} authorization JWT Token
 * @apiName createAlearnerFaq
 * @apiGroup Faq
 */
router.post('/', createAlearnerFaq);

/**
 * @api {patch} /:id Update a learner Faq
 * @apiHeader {String} authorization JWT Token
 * @apiName createAlearnerFaq
 * @apiGroup Faq
 */
router.patch('/:id', updateAlearnerFaq);

/**
 * @api {delete} /:id Delete a learner Faq
 * @apiHeader {String} authorization JWT Token
 * @apiName createAlearnerFaq
 * @apiGroup Faq
 */
router.delete('/:id', deleteAlearnerFaq);
export default router;
