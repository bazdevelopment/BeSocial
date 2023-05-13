import express from 'express';

import { verifyUser } from 'middleware/auth-middleware';
import { blockUser, unblockUser } from '../controllers/block-user';

const router = express.Router();

router.route('/user/block/:followerId').put(verifyUser, blockUser);
router.route('/user/unblock/:followerId').put(verifyUser, unblockUser);

export default router;
