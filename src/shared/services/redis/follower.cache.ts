import { IFollowerData } from 'features/follower/interface/follower.interface';
import { getRedisClient } from './redis.connection';
import { ServerError } from 'middleware/error-middleware';
import { getUserFromCache } from './user.cache';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import mongoose, { ObjectId } from 'mongoose';
import { BLOCK_UNBLOCK_ACTION, BlockUnblockActionType } from 'constants/block-unblock';

/**
 * saveFollowerToCache
 * function used to save follower to redis cache
 */
export const saveFollowerToCache = async (key: string, value: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    await client.LPUSH(key, value);
  } catch (error) {
    console.log('[follower.cache-saveFollowerToCache] : Server error');
    ServerError("[follower.cache-saveFollowerToCache] : Server error'");
  }
};

/**
 * removeFollowerFromCache
 * function used to remove a follower from redis cache
 */
export const removeFollowerFromCache = async (key: string, value: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    await client.LREM(key, 1, value);
  } catch (error) {
    console.log('[follower.cache-removeFollowerFromCache] : Server error');
    ServerError("[follower.cache-removeFollowerFromCache] : Server error'");
  }
};

/**
 * updateFollowersCountInCache
 * Function used to update followersCount/followingCount properties from user collection
 */
export const updateFollowersCountInCache = async (userId: string, propertyName: string, value: number): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    await client.HINCRBY(`users:${userId}`, propertyName, value);
  } catch (error) {
    console.log('[follower.cache-updateFollowersCountInCache] : Server error');
    ServerError("[follower.cache-updateFollowersCountInCache] : Server error'");
  }
};

/**
 * getFollowersFromCache
 * Function used to get all the followers/following that a specific user has
 */
export const getFollowersOrFollowingFromCache = async (key: string): Promise<IFollowerData[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* get all the followers */
    const followers: string[] = await client.LRANGE(key, 0, -1);

    const followersList: IFollowerData[] = [];
    /* map throughout the followers and return user details */
    for (const follower of followers) {
      const followerUserDetails: IUserDocument = (await getUserFromCache(follower)) as IUserDocument;
      const data: IFollowerData = {
        avatarColor: followerUserDetails.avatarColor!,
        followersCount: followerUserDetails.followersCount,
        followingCount: followerUserDetails.followingCount,
        profilePicture: followerUserDetails.profilePicture,
        postCount: followerUserDetails.postsCount,
        username: followerUserDetails.username!,
        userId: followerUserDetails.userId!,
        _id: new mongoose.Types.ObjectId(followerUserDetails._id),
        userProfile: followerUserDetails
      };

      followersList.push(data);
    }

    return followersList;
  } catch (error) {
    console.log('[follower.cache-getFollowersFromCache] : Server error');
    return ServerError("[follower.cache-getFollowersFromCache] : Server error'");
  }
};

/**
 * getFollowersFromCache
 * Function used to get all the followers/following that a specific user has
 */
export const updateBlockedUserInCache = async ({
  userId,
  propertyName,
  propertyValue,
  actionType
}: {
  userId: string | ObjectId;
  propertyName: string;
  propertyValue: string;
  actionType: BlockUnblockActionType;
}): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const propertyFromCache: string = (await client.HGET(`users:${userId}`, propertyName)) as string;
    let blockedOrBlockedBy: string[] = JSON.parse(propertyFromCache);

    if (actionType === BLOCK_UNBLOCK_ACTION.BLOCK) {
      blockedOrBlockedBy.push(propertyValue);
    }
    if (actionType === BLOCK_UNBLOCK_ACTION.UNBLOCK) {
      const newBlocked: string[] = blockedOrBlockedBy.filter((id: string) => id !== userId);
      blockedOrBlockedBy = newBlocked;
    }

    const dataToSave: string[] = [`${propertyName}`, JSON.stringify(blockedOrBlockedBy)];
    await client.HSET(`users:${userId}`, dataToSave);
  } catch (error) {
    console.log('[follower.cache-updateBlockedUserInCache] : Server error');
    return ServerError("[follower.cache-updateBlockedUserInCache] : Server error'");
  }
};
