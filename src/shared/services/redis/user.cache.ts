import { IUserDocument } from 'features/user/interfaces/user.interface';
import { generateUniqueId } from 'shared/globals/helpers/generate-unique-id';
import { parseJson } from 'shared/globals/helpers/parse-json';
import { getRedisClient } from './redis.connection';

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
