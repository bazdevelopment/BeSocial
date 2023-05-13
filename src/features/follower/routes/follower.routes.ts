import express from 'express';

import { verifyUser } from 'middleware/auth-middleware';
import { followUser } from '../controllers/follow-user';
import { getFollowersUsers, getFollowingUsers } from '../controllers/get-followers';
import { unfollowUser } from '../controllers/unfollow-user';

const router = express.Router();

/* GET */
router.route('/user/following').get(verifyUser, getFollowingUsers);
router.route('/user/followers/:userId').get(verifyUser, getFollowersUsers);

/* PUT */
router.route('/user/:followerId').put(verifyUser, followUser);
router.route('/user/unfollow/:followeeId/:followerId').put(verifyUser, unfollowUser);

export default router;
