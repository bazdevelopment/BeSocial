import { Request, Response } from 'express';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { UserService } from 'shared/services/db/user.service';
import { getUserFromCache } from 'shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';

/**
 * Get current logged in user
 * User can be fetched from redis cache if it exists,if not, we fetch the user from MongoDB
 * @route GET api/v1/auth/signup
 * @access Public
 */
export const getCurrentLoggedInUser = async (req: Request, res: Response): Promise<void> => {
  let isUserLoggedIn = false;
  let token: string | null = null;
  let user: IUserDocument | null = null;

  const cachedUser: IUserDocument | null = await getUserFromCache(req.currentUser!.userId);

  const existingUser = cachedUser ? cachedUser : await UserService.getUserByUserId(req.currentUser!.userId);
  if (Object.keys(existingUser).length) {
    isUserLoggedIn = true;
    token = req.session?.jwt;
    user = existingUser;
  }
  res.status(HTTP_STATUS.OK).json({ isUserLoggedIn, user, token });
};
