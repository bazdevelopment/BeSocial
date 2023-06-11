import { Request, Response } from 'express';
import { IAllUsers, IUserDocument } from '@src/features/user/interfaces/user.interface';
import { UserService } from '@src/shared/services/db/user.service';
import { geAllUsersFromCache, getTotalUsersCountFromCache } from '@src/shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';
import { IFollowerData } from '@src/features/follower/interface/follower.interface';
import { getFollowersOrFollowingFromCache } from '@src/shared/services/redis/follower.cache';
import { FollowService } from '@src/shared/services/db/follower.service';
import mongoose from 'mongoose';
import { BadRequestError } from '@src/middleware/error-middleware';

const PAGE_SIZE = 10;
/**
 * Get all users
 * controller used to fetch all the users using pagination without including logged in user
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid request parameters.');
  }
  const page: number = Number(req.params.page) || 1;
  const skip: number = (page - 1) * PAGE_SIZE;
  const limit = PAGE_SIZE;
  const allUsers = await fetchAllUsers(req.currentUser.userId, skip, limit);
  const followers = await fetchUserFollowers(req.currentUser.userId);

  res
    .status(HTTP_STATUS.OK)
    .json({ message: 'Fetch all users successfully', users: allUsers.users, totalUsers: allUsers.totalUsers, followers });
};

/** helper for fetching the users from cache/mongoDB */
const fetchAllUsers = async (userId: string, skip: number, limit: number): Promise<IAllUsers> => {
  let users;
  let type = '';

  const cachedUsers: IUserDocument[] = (await geAllUsersFromCache(skip, limit, userId)) as IUserDocument[];
  if (cachedUsers.length) {
    type = 'redis';
    users = cachedUsers;
  } else {
    type = 'mongodb';
    users = await UserService.getAllUsers(userId, skip, limit);
  }
  const totalUsers = await fetchUsersCount(type);
  return { users, totalUsers };
};
/** helper for getting the total number of users from redis cache/mongodb */
const fetchUsersCount = async (type: string): Promise<number> => {
  const totalUsers: number = type === 'redis' ? await getTotalUsersCountFromCache() : await UserService.getTotalUsersCountInDB();
  return totalUsers;
};

/**get user followers */
const fetchUserFollowers = async (userId: string): Promise<IFollowerData[]> => {
  const cachedFollowers: IFollowerData[] = await getFollowersOrFollowingFromCache(`followers:${userId}`);
  const followers = cachedFollowers.length ? cachedFollowers : await FollowService.getUserFollowers(new mongoose.Types.ObjectId(userId));
  return followers;
};
