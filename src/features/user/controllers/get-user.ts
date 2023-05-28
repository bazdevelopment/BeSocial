import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '../interfaces/user.interface';
import { getUserFromCache } from 'shared/services/redis/user.cache';
import { UserService } from 'shared/services/db/user.service';
/**
 * getUser
 * controller used to fetch the user profile from redis cache/mongodb
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  const cachedUser: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
  const loggedInUser = cachedUser ? cachedUser : UserService.getUserByUserId(userId);

  res.status(HTTP_STATUS.OK).json({ message: 'Fetch user profile successfully', user: loggedInUser });
};
