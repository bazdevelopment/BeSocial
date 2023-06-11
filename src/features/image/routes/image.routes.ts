import express from 'express';
import { joiValidation } from '@src/middleware/joi-validation';

import { addImageSchema } from '../schemes/image';
import { verifyUser } from '@src/middleware/auth-middleware';
import { addBackgroundImage, addProfilePicture } from '../controllers/add-image';
import { deleteBackgroundImage, deleteProfilePicture } from '../controllers/delete-image';
import { getImages } from '../controllers/get-images';

const router = express.Router();
/* GET */
router.route('/:userId').get(verifyUser, getImages);

/* POST */
router.route('/profile').post(verifyUser, joiValidation(addImageSchema), addProfilePicture);
router.route('/background').post(verifyUser, joiValidation(addImageSchema), addBackgroundImage);

/* DELETE */
router.route('/profile/:imageId').delete(verifyUser, deleteProfilePicture);
router.route('/background/:bgImageId').delete(verifyUser, deleteBackgroundImage);

export default router;
