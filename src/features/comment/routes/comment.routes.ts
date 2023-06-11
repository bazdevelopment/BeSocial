import express from 'express';
import { joiValidation } from '@src/middleware/joi-validation';

import { verifyUser } from '@src/middleware/auth-middleware';
import { getCommentsForPost, getCommentsPostUserNames, getSingleComment } from '../controllers/get-comments';
import { addCommentSchema } from '../schemes/comment.scheme';
import { addComment } from '../controllers/add-comment';

const router = express.Router();
/* GET */
router.route('/posts/:postId').get(verifyUser, getCommentsForPost);
router.route('/posts/usernames/:postId').get(verifyUser, getCommentsPostUserNames);
router.route('/posts/single-comment/:postId/:commentId').get(verifyUser, getSingleComment);
/* POST */
router.route('/post').post(joiValidation(addCommentSchema), verifyUser, addComment);

export default router;
