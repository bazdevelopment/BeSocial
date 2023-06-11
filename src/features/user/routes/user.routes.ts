import express from 'express';
import { verifyUser } from '@src/middleware/auth-middleware';
import { getAllUsers } from '../controllers/get-all-users';
import { getLoggedInUser } from '../controllers/get-logged-in-user';
import { getUser } from '../controllers/get-user';
import { getUserAndPosts } from '../controllers/get-user-and-posts';
import { getRandomUsersSuggestions } from '../controllers/get-random-users';
import { searchUsers } from '../controllers/search-users';
import { updateBasicUserInfo } from '../controllers/update-user-basic-info';
import { joiValidation } from '@src/middleware/joi-validation';
import { basicInfoSchema, notificationSettingsSchema, socialLinksSchema } from '../schemes/user.schemes';
import { updateUserInfoSocialLinks } from '../controllers/update-user-social-links';
import { updateUserNotificationSettings } from '../controllers/update-user-notification-settings';

const router = express.Router();
/* GET */
router.route('/all/:page').get(verifyUser, getAllUsers);
router.route('/current-user').get(verifyUser, getLoggedInUser);
router.route('/user/:userId').get(verifyUser, getUser);
router.route('/user/profile/posts/:userId/:username').get(verifyUser, getUserAndPosts);
router.route('/suggestions').get(verifyUser, getRandomUsersSuggestions);
router.route('/search/:query').get(verifyUser, searchUsers);

/* PUT */
router.route('/basic-info').put(verifyUser, joiValidation(basicInfoSchema), updateBasicUserInfo);
router.route('/social-links').put(verifyUser, joiValidation(socialLinksSchema), updateUserInfoSocialLinks);
router.route('/notification-settings').put(verifyUser, joiValidation(notificationSettingsSchema), updateUserNotificationSettings);

export default router;
