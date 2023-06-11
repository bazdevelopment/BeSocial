import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { updatePropertyInUserCache } from '@src/shared/services/redis/user.cache';
import { userQueue } from '@src/shared/services/queues/user.queue';
import { BadRequestError } from '@src/middleware/error-middleware';

/**
 * updateUserNotificationSettings
 * controller used to update the notification settings in the user profile; {"messages":false,"reactions":false,"comments":false,"follows":false}
 */
export const updateUserNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  const notificationSettings = req.body;

  await updatePropertyInUserCache(req.currentUser.userId, 'notifications', notificationSettings);
  userQueue().addUserJob('updateUserNotificationSettings', {
    userId: req.currentUser.userId,
    fields: notificationSettings
  });
  res.status(HTTP_STATUS.OK).json({ message: 'User notification settings updated successfully!' });
};
