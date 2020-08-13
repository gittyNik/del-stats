import Express from 'express';
import {
  getTag, getTags, updateTags, deleteTags, createTags, getTagIdName, getTagIdNames,
} from '../../controllers/learning/tags.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

/**
 * @api {get} /tags Get all tags
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTags
 * @apiGroup Tags
 */
router.get('/', getTags);

/**
 * @api {get} /tags/:id Get a tag by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTags
 * @apiGroup Tags
 */
router.get('/:id', getTag);

/**
 * @api {get} /tags/tag_name/:tag_name Get a tag by name
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTagsByName
 * @apiGroup Tags
 */
router.get('/tag/:tag_name', getTagIdName);

/**
 * @api {post} /tags/ Get mutiple tags
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTagsByName
 * @apiGroup Tags
 */
router.post('/search', getTagIdNames);

// Restrict modifications for any applicant to the cohorts
router.use(allowSuperAdminOnly);

/**
 * @api {post} /tags Create a tag
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateTags
 * @apiGroup Tags
 */
router.post('/', createTags);

/**
 * @api {patch} /tags/:id Update tag
 * @apiHeader {String} authorization JWT Token.
 * @apiName EditTags
 * @apiGroup Tags
 */
router.patch('/:id', updateTags);

/**
 * @api {delete} /tags/:id Delete a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteTags
 * @apiGroup Tags
 */
router.delete('/:id', deleteTags);

export default router;
