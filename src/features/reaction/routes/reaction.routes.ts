import express from 'express';
import { verifyUser } from 'middleware/auth-middleware';
import { joiValidation } from 'middleware/joi-validation';
import { addReaction } from '../controllers/add-reaction';
import { addReactionSchema } from '../schemes/reaction';
import { removeReaction } from '../controllers/remove-reaction';
import { getReactionsByUsername, getReactionsForParticularPost, getSingleReactionByUsername } from '../controllers/get-reactions';

const router = express.Router();

/* GET */
router.route('/:postId').get(verifyUser, getReactionsForParticularPost);
router.route('/single/:username/:postId').get(verifyUser, getSingleReactionByUsername);
router.route('/all/:username').get(verifyUser, getReactionsByUsername);

/* POST */
router.route('/add-reaction').post(joiValidation(addReactionSchema), verifyUser, addReaction);

/* DELETE */
router.route('/:postId/:previousReaction/:postReactions').delete(verifyUser, removeReaction);

export default router;
