import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '../interfaces/user.interface';
import { getUserFromCache } from '@src/shared/services/redis/user.cache';
import { UserService } from '@src/shared/services/db/user.service';
import { BadRequestError } from '@src/middleware/error-middleware';
/**
 * getLoggedInUser
 * controller used for fetching the logged in user profile info
 */
export const getLoggedInUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  const cachedUser: IUserDocument = (await getUserFromCache(req.currentUser.userId)) as IUserDocument;
  const loggedInUser = cachedUser ? cachedUser : UserService.getUserByUserId(req.currentUser.userId);

  res.status(HTTP_STATUS.OK).json({ message: 'Fetch logged in user profile successfully', user: loggedInUser });
};
