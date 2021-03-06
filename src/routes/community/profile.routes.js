import express from 'express';
import { getProfile, updateProfile, addProfilePictureAPI } from '../../controllers/community/user.controller';

const router = express.Router();

/**
 * @api {get} /profile Get profile
 * @apiDescription Get the profile information of the currently loggedin user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetProfile
 * @apiGroup Profile
 */
router.get('/', getProfile);

/**
 * @api {patch} /profile  Update profile of user
 * @apiDescription Update user's profile
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserProfile
 * @apiGroup Profile
 *
 * @apiParam {String} email Email of user
 * @apiParam {String} name Name of user
 * @apiParam {String} location Current city of user
 * @apiParam {Object} profile Profile details of user
 */
router.patch('/', updateProfile);

/**
 * @api {patch} /picture  Update profile picture of user
 * @apiDescription Update user's profile picture
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserProfile
 * @apiGroup Profile
 *
 * @apiParam {String} user_id User Id
 * @apiParam {String} picture_url Profile Picture url
 */
router.post('/picture', addProfilePictureAPI);

export default router;
