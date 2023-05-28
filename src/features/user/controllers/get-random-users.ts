import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '../interfaces/user.interface';
import { getRandomUsersFromCache } from 'shared/services/redis/user.cache';
import { UserService } from 'shared/services/db/user.service';
import { BadRequestError } from 'middleware/error-middleware';

/**
 * getRandomUsersSuggestions
 * controller used for fetching user suggestions
 * !scenario: we display random users which are not followed yet by a specific user/logged in user
 */
export const getRandomUsersSuggestions = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  let randomUsers: IUserDocument[] = [];
  const cachedUsers: IUserDocument[] = await getRandomUsersFromCache(req.currentUser.userId);
  if (cachedUsers.length) {
    randomUsers = cachedUsers;
  } else {
    randomUsers = await UserService.getRandomUsers(req.currentUser.userId);
  }

  res.status(HTTP_STATUS.OK).json({ message: 'Get user suggestions successfully', users: randomUsers });
};
