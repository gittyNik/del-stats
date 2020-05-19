import Express from 'express';
import {
  getAllReviewsAPI, getReviewsByIdAPI, getReviewsByStatusAPI,
  getReviewsByTeamAPI, getReviewsByUserIdAPI,
  createReview, addReviewsForTeamAPI,
  createReviewScheduleAPI,
  getUserAndTeamReviewsAPI,
} from '../../controllers/learning/reviews.controller';
import {
  allowMultipleRoles,
  allowAdminsOnly,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/reviews Get all Reviews
 * @apiDescription get all Reviews
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviews
 * @apiGroup Reviews
 */
router.get('/', getAllReviewsAPI);

/**
 * @api {get} /learning/content/reviews/:id Get reviews for Team
 * @apiDescription get a document for Team
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviews
 * @apiGroup Reviews
 */
router.get('/:id', getReviewsByTeamAPI);

/**
 * @api {get} /learning/content/reviews/review/:id/ Get review by id
 * @apiDescription get review by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviews
 * @apiGroup Reviews
 */
router.get('/review/:id', getReviewsByIdAPI);

/**
 * @api {get} /learning/content/reviews/user/ Get review for user
 * @apiDescription get review for user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewsForUser
 * @apiGroup Reviews
 */
router.get('/user/:id', getReviewsByUserIdAPI);

/**
 * @api {get} /learning/content/reviews/user/team Get review for users
 * @apiDescription get review for user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewsForUser
 * @apiGroup Reviews
 */
router.get('/user/team/:id', getUserAndTeamReviewsAPI);

/**
 * @api {get} /learning/content/reviews/status/:id/ Get Reviews by status
 * @apiDescription get Reviews by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewsByStatus
 * @apiGroup Reviews
 */
router.get('/status/:id', getReviewsByStatusAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {get} /learning/content/reviews/status/:id/ Get Reviews by status
 * @apiDescription get Reviews by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewsByStatus
 * @apiGroup Reviews
 */
router.post('/schedule', createReviewScheduleAPI);

/**
 * @api {post} /learning/content/reviews/ Add Team Reviews
 * @apiDescription Add a Teams Review
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddTeamReview
 * @apiGroup Reviews

 * @apiParam {String} id Team Milestone ID
 * @apiParam {String} milestone_name Description of the topic
 * @apiParam {String} status Status of review
 * @apiParam {String} scheduled_at scheduled date time
 * @apiParam {String} call_details json call details
 * @apiParam {String} zoom_url join url for Zoom call
 */
router.post('/', createReview);

/**
 * @api {patch} /learning/content/reviews/:id  Update Team Reviews
 * @apiDescription Update a Team Review
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTeamReview
 * @apiGroup Reviews
 *
 * @apiParam {String} id Team Milestone ID
 * @apiParam {String} learner_feedbacks Array of Learner feedbacks
 * @apiParam {String} team_feedback Team Feedbackx
 * @apiParam {String} status ID of the Milestone
 * @apiParam {String} additional_details Details regarding the review
 */
router.patch('/:id', addReviewsForTeamAPI);

/**
 * @api {delete} /learning/content/topics/:id Delete Content Topic
 * @apiDescription Delete a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteUserDocument
 * @apiGroup Reviews
 */
// router.delete('/:id', deleteOne);

export default router;
