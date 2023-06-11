import { Request, Response } from 'express';
import { getFollowersOrFollowingFromCache } from '@src/shared/services/redis/follower.cache';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IFollowerData } from '../interface/follower.interface';
import { FollowService } from '@src/shared/services/db/follower.service';
/**
 * getFollowingUsers
 * Controller used to get al the following users for a specific user
 */
export const getFollowingUsers = async (req: Request, res: Response): Promise<void> => {
  const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
  const cachedFollowingUsers = await getFollowersOrFollowingFromCache(`following:${req.currentUser?.userId}`);
  const followingUsers: IFollowerData[] = cachedFollowingUsers.length
    ? cachedFollowingUsers
    : await FollowService.getFollowingUsers(userObjectId);
  res.status(HTTP_STATUS.OK).json({ message: 'Successfully getting following users!', following: followingUsers });
};

/**
 * getFollowingUsers
 * Controller used to get al the followers users for a specific user
 */
export const getFollowersUsers = async (req: Request, res: Response): Promise<void> => {
  const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
  const cachedFollowersUsers = await getFollowersOrFollowingFromCache(`followers:${req.params.userId}`);
  const followersUsers: IFollowerData[] = cachedFollowersUsers.length
    ? cachedFollowersUsers
    : await FollowService.getUserFollowers(userObjectId);
  res.status(HTTP_STATUS.OK).json({ message: 'Successfully getting following users!', followers: followersUsers });
};
