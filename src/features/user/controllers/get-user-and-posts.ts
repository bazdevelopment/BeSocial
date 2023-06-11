import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '../interfaces/user.interface';
import { getUserFromCache } from '@src/shared/services/redis/user.cache';
import { UserService } from '@src/shared/services/db/user.service';
import { IPostDocument } from '@src/features/post/interfaces/post.interface';
import { getUserPostsFromCache } from '@src/shared/services/redis/post.cache';
import { PostService } from '@src/shared/services/db/post.service';
/**
 * getUserAndPosts
 * controller used for fetching user profile and posts that he has created
 * !scenarios: on the FE side we can navigate to a specific user profile and we want to see some user info/posts created
 */
export const getUserAndPosts = async (req: Request, res: Response): Promise<void> => {
  const { userId, username } = req.params;
  const cachedUser: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
  const cachedUserPosts: IPostDocument[] = await getUserPostsFromCache('post', Number(userId?.split('').filter(Number).join('')));

  const existingUser = cachedUser ? cachedUser : await UserService.getUserByUserId(userId);
  const existingUserPosts = cachedUserPosts.length
    ? cachedUserPosts
    : await PostService.getPostsFromDB({ username }, 0, 100, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: 'Get user profile and posts successfully', user: existingUser, posts: existingUserPosts });
};
