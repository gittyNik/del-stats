import Express from 'express';
import {
  getAllResourcesByTopic, create, getAllTopics,
  getTopic, deleteOne, updateTopic,
} from '../../controllers/learning/topic.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER]));

/**
 * @api {get} /learning/content/topics Get all Content Topics
 * @apiDescription get all Content Topics
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopics
 * @apiGroup ContentTopics
 */
router.get('/', getAllTopics);

/**
 * @api {get} /learning/content/topics/:id Get a Content Topic
 * @apiDescription get a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopic
 * @apiGroup ContentTopic
 */
router.get('/:id', getTopic);

/**
 * @api {get} /learning/content/topics/:id/resources Get Content Topic Resources
 * @apiDescription get Content Topic Resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopicResources
 * @apiGroup ContentTopicResources
 */
router.get('/:id/resources', getAllResourcesByTopic);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/topics Add Content Topic
 * @apiDescription Add a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentTopic
 * @apiGroup ContentTopic

 * @apiParam {String} title Title of the topic
 * @apiParam {String} description Description of the topic
 * @apiParam {String} milestone_id ID of the Milestone
 */
router.post('/', create);

/**
 * @api {patch} /learning/content/topics/:id  Update Content Topic
 * @apiDescription Update a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentTopic
 * @apiGroup ContentTopic
 *
 * @apiParam {String} title title of the topic
 * @apiParam {String} description Description of the topic
 * @apiParam {String} milestone_id UUID of the Milestone
 */
router.patch('/:id', updateTopic);

/**
 * @api {delete} /learning/content/topics/:id Delete Content Topic
 * @apiDescription Delete a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentTopic
 * @apiGroup ContentTopic
 */
router.delete('/:id', deleteOne);

export default router;
