import { Request, Response } from 'express';
import { removeFollowerFromCache, updateFollowersCountInCache } from '@src/shared/services/redis/follower.cache';
import HTTP_STATUS from 'http-status-codes';
import { followQueue } from '@src/shared/services/queues/follow.queue';
/**
 * Utility function used to unfollow a specific user
 */
export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  const { followeeId, followerId } = req.params;
  if (!followerId || !followeeId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* update followers/following from redis cache*/
  const updateFollowersFromCache: Promise<void> = removeFollowerFromCache(`followers:${followeeId}`, followerId);
  const updateFollowingFromCache: Promise<void> = removeFollowerFromCache(`following:${req.currentUser?.userId}`, followeeId);

  const updateUserFollowerCountCache: Promise<void> = updateFollowersCountInCache(followeeId, 'followersCount', -1);
  const updateUserFolloweeCountCache: Promise<void> = updateFollowersCountInCache(followerId, 'followingCount', -1);

  await Promise.all([updateFollowersFromCache, updateFollowingFromCache, updateUserFollowerCountCache, updateUserFolloweeCountCache]);
  followQueue().addFollowJob('removeFollowerFromDB', { userId: followerId, followeeId: followeeId as string });
  res.status(HTTP_STATUS.OK).json({ message: 'Unfollow user now!' });
};
