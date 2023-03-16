import express from 'express';
import { verifyUser } from 'middleware/auth-middleware';
import { joiValidation } from 'middleware/joi-validation';
import { getCurrentLoggedInUser } from '../controllers/current-users.controller';
import { signIn } from '../controllers/sign-in.controller';
import { signOut } from '../controllers/sign-out.controller';
import { signUp } from '../controllers/sign-up.controller';
import { signInSchema } from '../schemes/sign-in';
import { signUpSchema } from '../schemes/sign-up';

const router = express.Router();

router.route('/signup').post(joiValidation(signUpSchema), signUp);
router.route('/signin').post(joiValidation(signInSchema), signIn);
router.route('/signout').get(signOut);
router.route('/current-user').get(verifyUser, getCurrentLoggedInUser);

export default router;
