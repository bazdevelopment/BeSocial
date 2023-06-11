import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { updatePropertyInUserCache } from '@src/shared/services/redis/user.cache';
import { userQueue } from '@src/shared/services/queues/user.queue';
import { BadRequestError } from '@src/middleware/error-middleware';

/**
 * updateBasicUserInfo
 * controller used to update basic information in the user profile like quote, work, location and so on.
 */
export const updateBasicUserInfo = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  for (const [basicInfoName, basicInfoValue] of Object.entries(req.body)) {
    await updatePropertyInUserCache(req.currentUser.userId, basicInfoName, `${basicInfoValue}`);
  }
  userQueue().addUserJob('updateUserBasicInfo', {
    userId: req.currentUser.userId,
    fields: req.body
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Basic user info fields updated successfully!' });
};
