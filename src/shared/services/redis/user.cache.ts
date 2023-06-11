import { IUserDocument } from '@src/features/user/interfaces/user.interface';
import { generateUniqueId } from '@src/shared/globals/helpers/generate-unique-id';
import { parseJson } from '@src/shared/globals/helpers/parse-json';
import { getRedisClient } from './redis.connection';
import { ServerError } from '@src/middleware/error-middleware';
import { shuffle } from '@src/shared/globals/helpers/shuffle';

/**
 * Function that saves the registered user in the redis caches using hashes
 */
export const saveUserToCache = async (createdUser: IUserDocument) => {
  const createdAt = new Date();
  const uniqueNumberId: number = generateUniqueId();
  const {
    _id,
    userId,
    username,
    email,
    avatarColor,
    blocked,
    blockedBy,
    postsCount,
    profilePicture,
    followersCount,
    followingCount,
    notifications,
    work,
    location,
    school,
    quote,
    bgImageId,
    bgImageVersion,
    social
  } = createdUser;

  const dataToSave = {
    _id: `${_id}`,
    userId: `${userId}`,
    username: `${username}`,
    email: `${email}`,
    avatarColor: `${avatarColor}`,
    createdAt: `${createdAt}`,
    postsCount: `${postsCount}`,
    blocked: JSON.stringify(blocked),
    blockedBy: JSON.stringify(blockedBy),
    profilePicture: `${profilePicture}`,
    followersCount: `${followersCount}`,
    followingCount: `${followingCount}`,
    notifications: JSON.stringify(notifications),
    social: JSON.stringify(social),
    work: `${work}`,
    location: `${location}`,
    school: `${school}`,
    quote: `${quote}`,
    bgImageVersion: `${bgImageVersion}`,
    bgImageId: `${bgImageId}`
  };

  try {
    const client = getRedisClient();

    if (!client.isOpen) {
      await client.connect();
    }
    await client.ZADD('user', { score: uniqueNumberId, value: `${userId}` });
    for (const [key, value] of Object.entries(dataToSave)) {
      await client.HSET(`users:${userId}`, `${key}`, `${value}`);
    }
  } catch (error) {
    console.log('[user.cache] : Server error');
  }
};

/**
 * Function that gets the user from the redis cache is exist
 */
export const getUserFromCache = async (userId: string | undefined): Promise<IUserDocument | null> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }

    const response: IUserDocument = (await client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;

    if (!response) return null;
    Object.entries(response).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        response[key] = parseJson(value);
      }
    });
    return response;
  } catch (error) {
    console.log('[user.cache] : Server error');
    return null;
  }
};
/**
 * Function that gets all the users from redis cache except for excludedUserKey
 * !scenarios: we don't want to also include in the response the logged in user
 */
export const geAllUsersFromCache = async (start: number, end: number, excludedUserKey: string): Promise<IUserDocument[] | null> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }

    const userIds: string[] = await client.ZRANGE('user', start, end, { REV: true });
    const users: IUserDocument[] = [];
    for (const userId of userIds) {
      if (userId !== excludedUserKey) {
        const user = await client.HGETALL(`users:${userId}`);

        user.social = parseJson(`${user.social}`);
        user.blocked = parseJson(`${user.blocked}`);
        user.blockedBy = parseJson(`${user.blockedBy}`);
        user.notifications = parseJson(`${user.notifications}`);
        user.profilePicture = parseJson(`${user.profilePicture}`);
        user.bgImageId = parseJson(`${user.bgImageId}`);
        user.bgImageVersion = parseJson(`${user.bgImageVersion}`);
        users.push(JSON.parse(JSON.stringify(user)));
      }
    }

    return users;
  } catch (error) {
    console.log('[user.cache: geAllUsersFromCache] : Server error');
    return null;
  }
};

/**
 * Function update a specific property for user document in user redis cache
 */
export const updatePropertyInUserCache = async (userId: string, propertyName: string, propertyValue: string): Promise<IUserDocument> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const stringifiedValue = typeof propertyValue === 'string' ? propertyValue : JSON.stringify(propertyValue);
    const dataToSave: string[] = [`${propertyName}`, stringifiedValue];
    /* update the user in cache with property provided */
    await client.HSET(`users:${userId}`, dataToSave);
    /* fetch again the new updated user document from redis cache*/
    const response: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
    return response;
  } catch (error) {
    console.log('[user.cache-updatePropertyInUserCache] : Server error');
    return ServerError('[user.cache-updatePropertyInUserCache] : Server error');
  }
};
/**
 * getTotalUsersCountFromCache
 * function used for fetching the total number of users that exists in redis cache
 */
export const getTotalUsersCountFromCache = async (): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const count: number = await client.ZCARD('user');
    return count;
  } catch (error) {
    console.log('[user.cache-getTotalUsersCountFromCache] : Server error');
    return ServerError('[user.cache-getTotalUsersCountFromCache] : Server error');
  }
};

/**
 * getRandomUsersFromCache
 * function used to return random users from cache
 * !we return the users that the logged in user doesn't follow
 * for now we return only 10 users
 */
export const getRandomUsersFromCache = async (userId: string): Promise<IUserDocument[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const followingUsers = await client.LRANGE(`following:${userId}`, 0, -1);
    const usersFromCache: string[] = await client.ZRANGE('user', 0, -1);
    const randomUsers = shuffle(usersFromCache);
    const userSuggestions = [];

    for (const id of randomUsers.slice(0, 10)) {
      const isFollowingUser = followingUsers.includes(id);
      if (!isFollowingUser) {
        const user = (await getUserFromCache(id)) as IUserDocument;
        userSuggestions.push(user);
      }
    }

    return userSuggestions;
  } catch (error) {
    console.log('[user.cache-getRandomUsersFromCache] : Server error');
    return ServerError('[user.cache-getRandomUsersFromCache] : Server error');
  }
};
