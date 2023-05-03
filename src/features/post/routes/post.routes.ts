import express from 'express';
import { joiValidation } from 'middleware/joi-validation';
import { createPost, createPostWithImage } from '../controllers/create-post';
import { postImageScheme, postScheme, postVideoScheme } from '../schemes/post.scheme';
import { getPosts, getPostsWithImages } from '../controllers/get-posts';
import { verifyUser } from 'middleware/auth-middleware';
import { deletePost } from '../controllers/delete-post';
import { updatePostWithVideo, updatePost, updatePostWithImage } from '../controllers/update-post';

const router = express.Router();
/* GET */
router.route('/posts/:page').get(verifyUser, getPosts);
router.route('/posts/images/:page').get(verifyUser, getPostsWithImages);
/* POST */
router.route('/create-post').post(verifyUser, joiValidation(postScheme), createPost);
router.route('/create-post-image').post(verifyUser, joiValidation(postImageScheme), createPostWithImage);
/* PUT */
router.route('/:postId').put(verifyUser, joiValidation(postScheme), updatePost);
router.route('/post-image/:postId').put(verifyUser, joiValidation(postImageScheme), updatePostWithImage);
router.route('/post-video/:postId').put(verifyUser, joiValidation(postVideoScheme), updatePostWithVideo);
/* DELETE */
router.route('/:postId').delete(verifyUser, deletePost);

export default router;
