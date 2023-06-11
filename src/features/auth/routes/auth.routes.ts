import express from 'express';
import { verifyUser } from '@src/middleware/auth-middleware';
import { joiValidation } from '@src/middleware/joi-validation';
import { getCurrentLoggedInUser } from '../controllers/current-users.controller';
import { generateResetPasswordLink, updatePassword } from '../controllers/forgot-password';
import { signIn } from '../controllers/sign-in.controller';
import { signOut } from '../controllers/sign-out.controller';
import { signUp } from '../controllers/sign-up.controller';
import { emailSchema, passwordSchema } from '../schemes/password';
import { signInSchema } from '../schemes/sign-in';
import { signUpSchema } from '../schemes/sign-up';

const router = express.Router();

router.route('/signup').post(joiValidation(signUpSchema), signUp);
router.route('/signin').post(joiValidation(signInSchema), signIn);
router.route('/signout').get(signOut);
router.route('/current-user').get(verifyUser, getCurrentLoggedInUser);
router.route('/forgot-password').post(joiValidation(emailSchema), generateResetPasswordLink);
router.route('/reset-password/:token').post(joiValidation(passwordSchema), updatePassword);

export default router;
