import { IPostDocument } from '@src/features/post/interfaces/post.interface';
import { getRedisClient } from './redis.connection';
import { parseJson } from '@src/shared/globals/helpers/parse-json';
import { ServerError } from '@src/middleware/error-middleware';

/**
 * Method used to save the created post in redis DB
 * @param createdPost
 */
export const savePostToCache = async (createdPost: IPostDocument): Promise<void> => {
  const {
    _id,
    userId,
    username,
    email,
    avatarColor,
    profilePicture,
    post,
    bgColor,
    feelings,
    privacy,
    gifUrl,
    commentsCount,
    imgVersion,
    imgId,
    videoId,
    videoVersion,
    reactions,
    createdAt
  } = createdPost;

  const dataToSave = {
    _id: `${_id}`,
    userId: `${userId}`,
    username: `${username}`,
    email: `${email}`,
    avatarColor: `${avatarColor}`,
    profilePicture: `${profilePicture}`,
    post: `${post}`,
    bgColor: `${bgColor}`,
    feelings: `${feelings}`,
    privacy: `${privacy}`,
    gifUrl: `${gifUrl}`,
    commentsCount: `${commentsCount}`,
    reactions: JSON.stringify(reactions),
    imgVersion: `${imgVersion}`,
    imgId: `${imgId}`,
    videoId: `${videoId}`,
    videoVersion: `${videoVersion}`,
    createdAt: `${createdAt}`
  };

  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();

    /* Get number of created posts by the logged in user */
    const postCount: string[] = await client.HMGET(`users:${userId}`, 'postsCount');
    /* Create redis collection with all the posts */
    /**
     * !score is an unique identifier representing only the integers from the userId */
    await client.ZADD('post', { score: Number(userId.split('').filter(Number).join('')), value: `${_id}` });
    for (const [key, value] of Object.entries(dataToSave)) {
      await client.HSET(`posts:${_id}`, `${key}`, `${value}`);
    }
    /* Increase the number of posts created by the logged in user*/
    const count: number = parseInt(postCount[0]!, 10) + 1;
    /* update the number of posts in the user object */
    await client.HSET(`users:${userId}`, 'postsCount', count);
  } catch (error) {
    console.log('[post.cache-savePostToCache] : Server error');
  }
};

/**
 * Method used to get all the created posts in redis DB using pagination
 */
export const getPostsFromCache = async (key: string, start: number, end: number) => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get all the posts IDS based with pagination, REV=true because we want the last post created to be first in the list */
    const postIds: string[] = await client.ZRANGE(key, start, end, { REV: true });
    const posts: { [x: string]: string }[] = [];

    for (const postId of postIds) {
      const post = await client.HGETALL(`posts:${postId}`);
      post.commentsCount = parseJson(`${post.commentsCount}`);
      post.reactions = parseJson(`${post.reactions}`);
      post.createdAt = parseJson(`${post.createdAt}`);
      posts.push(post);
    }

    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.log('[post.cache-getPostsFromCache] : Server error');
  }
};
/**
 * getTotalPostsInCache
 * returns the total number of posts from redis cache
 */
export const getTotalPostsInCache = async (): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const count: number = await client.ZCARD('posts');
    return count;
  } catch (error) {
    console.error(error);
    return ServerError('Server error. Try again.');
  }
};
/**
 * Method used to get all the created posts with images from redis DB using pagination
 */
export const getPostsWithImagesFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get all the posts IDS based with pagination, REV=true because we want the last post created to be first in the list */
    const postIds: string[] = await client.ZRANGE(key, start, end, { REV: true });
    const posts: { [x: string]: string }[] = [];

    for (const postId of postIds) {
      const post = await client.HGETALL(`posts:${postId}`);
      if ((post.imgId && post.imgVersion) || post.gifUrl) {
        post.commentsCount = parseJson(`${post.commentsCount}`);
        post.reactions = parseJson(`${post.reactions}`);
        post.createdAt = parseJson(`${post.createdAt}`);
        posts.push(post);
      }
    }
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error(error);
    return ServerError('Server error.[getPostsWithImagesFromCache] Try again.');
  }
};

/**
 * Method used to get all the created posts by a specific user from redis DB
 * uId = score in redis => this uid contains only the integers from the usersId
 */
export const getUserPostsFromCache = async (key: string, uId: number): Promise<IPostDocument[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();

    /* Get all the posts IDS based with pagination, REV=true because we want the last post created to be first in the list */
    const postIds: string[] = await client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
    const posts: { [x: string]: string }[] = [];

    for (const postId of postIds) {
      const post = await client.HGETALL(`posts:${postId}`);
      post.commentsCount = parseJson(`${post.commentsCount}`);
      post.reactions = parseJson(`${post.reactions}`);
      post.createdAt = parseJson(`${post.createdAt}`);
      posts.push(post);
    }
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error(error);
    return ServerError('Server error.[getUserPostsFromCache] Try again.');
  }
};
/**
 * Method used to the total length of all the created posts by a specific user from redis DB
 * uId = score in redis => this uid contains only the integers from the usersId
 */
export const getTotalUserPostsInCache = async (uId: number): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const count: number = await client.ZCOUNT('posts', uId, uId);
    return count;
  } catch (error) {
    console.error(error);
    return ServerError('Server error.[getUserPostsFromCache] Try again.');
  }
};

/**
 * Method used to delete a specific post from redis db
 */
export const deletePostFromCache = async (key: string, userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const postCount: string[] = await client.HMGET(`users:${userId}`, 'postsCount');
    await client.ZREM('post', `${key}`);
    await client.DEL(`posts:${key}`);
    await client.DEL(`comments:${key}`);
    await client.DEL(`reactions:${key}`);
    const count: number = parseInt(postCount[0]!, 10) - 1;
    await client.HSET(`users:${userId}`, 'postsCount', count);
  } catch (error) {
    console.error(error);
    return ServerError('Server error.[deletePostFromCache] Try again.');
  }
};
/**
 * Method used to delete a specific post from redis db
 */
export const updatePostInCache = async (key: string, updatedPost: IPostDocument): Promise<IPostDocument> => {
  const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = updatedPost;
  const dataToSave = {
    post: `${post}`,
    bgColor: `${bgColor}`,
    feelings: `${feelings}`,
    privacy: `${privacy}`,
    gifUrl: `${gifUrl}`,
    imgVersion: `${imgVersion}`,
    imgId: `${imgId}`,
    videoId: `${videoId}`,
    videoVersion: `${videoVersion}`,
    profilePicture: `${profilePicture}`
  };
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
      await client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
    }
    const postFromCache = await client.HGETALL(`posts:${key}`);
    postFromCache.commentsCount = parseJson(`${postFromCache.commentsCount}`);
    postFromCache.reactions = parseJson(`${postFromCache.reactions}`);
    postFromCache.createdAt = parseJson(`${postFromCache.createdAt}`);

    return JSON.parse(JSON.stringify(postFromCache));
  } catch (error) {
    console.error(error);
    return ServerError('Server error.[updatePostInCache] Try again.');
  }
};
