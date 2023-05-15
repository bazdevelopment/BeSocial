import express from 'express';

import { verifyUser } from 'middleware/auth-middleware';
import { deleteNotification } from '../controllers/delete-notification';
import { readNotification } from '../controllers/read-notification';

const router = express.Router();

/* DELETE */
router.route('/:notificationId').delete(verifyUser, deleteNotification);

/* PUT */
router.route('/:notificationId').put(verifyUser, readNotification);

export default router;
