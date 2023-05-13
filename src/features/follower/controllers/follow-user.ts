import { Request, Response } from 'express';
import { saveFollowerToCache, updateFollowersCountInCache } from 'shared/services/redis/follower.cache';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { getUserFromCache } from 'shared/services/redis/user.cache';
import { IFollowerData } from '../interface/follower.interface';
import mongoose from 'mongoose';
import { getIOInstance } from 'config/socketIO';
import { followQueue } from 'shared/services/queues/follow.queue';
import { ObjectId } from 'mongodb';
/**
 * followUser
 * controller used for following a specific user and update redis cache/mongoDB
 */
export const followUser = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();

  const { followerId } = req.params;
  if (!followerId || !req.currentUser?.userId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* update the followerCount/followingCount fields for both users in redis cache */
  const followersCount: Promise<void> = updateFollowersCountInCache(followerId, 'followersCount', 1);
  const followingCount: Promise<void> = updateFollowersCountInCache(req.currentUser?.userId, 'followingCount', 1);
  await Promise.all([followersCount, followingCount]);
  /* get updated users from redis cache */
  const cachedFollowerUser: Promise<IUserDocument> = getUserFromCache(followerId) as Promise<IUserDocument>;
  const cachedFollowingUser: Promise<IUserDocument> = getUserFromCache(req.currentUser?.userId) as Promise<IUserDocument>;
  const usersFromCache = await Promise.all([cachedFollowerUser, cachedFollowingUser]);
  const addFollowerData = getUserData(usersFromCache[0]);
  /* emit an add follower event with follower data, which is going to be sent on the FE */
  socketIo.emit('add follower', addFollowerData);
  /* save followers/following users in redis cache  */
  const addFollowerToCache: Promise<void> = saveFollowerToCache(`following:${req.currentUser?.userId}`, followerId);
  const addFollowingToCache: Promise<void> = saveFollowerToCache(`followers:${followerId}`, req.currentUser?.userId);
  await Promise.all([addFollowerToCache, addFollowingToCache]);

  /* save new follower to mongoDB  */
  followQueue().addFollowJob('addFollowerToDB', {
    userId: req.currentUser?.userId,
    followeeId: followerId,
    username: req.currentUser?.username,
    followerDocumentId: new ObjectId()
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Following user now!' });
};
/**
 * Utility function used to return some specific information about the user
 */
function getUserData(user: IUserDocument): IFollowerData {
  return {
    _id: new mongoose.Types.ObjectId(user.userId),
    username: user.username!,
    avatarColor: user.avatarColor!,
    postCount: user.postsCount,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    profilePicture: user.profilePicture,
    userId: user.userId!,
    userProfile: user
  };
}
