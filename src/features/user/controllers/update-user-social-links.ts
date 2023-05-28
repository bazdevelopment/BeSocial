import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { updatePropertyInUserCache } from 'shared/services/redis/user.cache';
import { userQueue } from 'shared/services/queues/user.queue';
import { BadRequestError } from 'middleware/error-middleware';

/**
 * updateUserInfoSocialLinks
 * controller used to update the social links in user profile
 */
export const updateUserInfoSocialLinks = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  const socialLinks = req.body;
  await updatePropertyInUserCache(req.currentUser.userId, 'social', socialLinks);
  userQueue().addUserJob('updateUserSocialLinks', {
    userId: req.currentUser.userId,
    fields: req.body
  });
  res.status(HTTP_STATUS.OK).json({ message: 'User social links updated successfully!' });
};
