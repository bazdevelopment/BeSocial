import { ServerError } from 'middleware/error-middleware';
import { getRedisClient } from './redis.connection';
import { ICommentDocument, ICommentNameList } from 'features/comment/interfaces/comment.interface';
/**
 * savePostCommentToCache
 * Function used to save a comment for a post in redis cache
 * Each time a new comment is added, the commentCount field from post in redis cache is increased
 */
export const savePostCommentToCache = async (postId: string, comment: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    await client.LPUSH(`comments:${postId}`, comment);
    /* Get number of comments attached to a post */
    const commentsCount: string[] = await client.HMGET(`posts:${postId}`, 'commentsCount');
    /* Increment the number of comments attached to a post */
    const incrementCommentCount: number = parseInt(commentsCount[0]!, 10) + 1;
    /* Populate again the commentCount field for a post*/
    const dataToSave: string[] = ['commentsCount', `${incrementCommentCount}`];
    await client.HSET(`posts:${postId}`, dataToSave);
  } catch (error) {
    console.log('[comment.cache-savePostCommentToCache] : Server error');
    ServerError("[comment.cache-savePostCommentToCache] : Server error'");
  }
};

/**
 * getPostCommentsFromCache
 * Function used get all the comments attached to a post from redis cache
 */
export const getPostCommentsFromCache = async (postId: string): Promise<ICommentDocument[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get all the comments from cache based on postId */
    const comments: string[] = await client.LRANGE(`comments:${postId}`, 0, -1);
    /* Parse all the comments because they are stringified in redis cache */
    const commentsList: ICommentDocument[] = [];
    for (const comment of comments) {
      commentsList.push(JSON.parse(comment));
    }
    return commentsList;
  } catch (error) {
    console.log('[post.cache-getPostCommentsFromCache] : Server error');
    return ServerError("[post.cache-getPostCommentsFromCache] : Server error'");
  }
};

/**
 * getPostCommentsNamesFromCache
 * Function used get comments count and a list of users that added a comment to a specific post
 */
export const getPostCommentsNamesFromCache = async (postId: string): Promise<ICommentNameList[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get the length of the comments for a specific post */
    const commentsCount: number = await client.LLEN(`comments:${postId}`);
    /* Get all comments for a specific post */
    const comments: string[] = await client.LRANGE(`comments:${postId}`, 0, -1);
    /* Populate an array with the names of all the users attached to a comment */
    const commentsNameList: string[] = [];
    for (const comment of comments) {
      const commentDetails = JSON.parse(comment);
      commentsNameList.push(commentDetails.username);
    }
    return [{ count: commentsCount, names: commentsNameList }];
  } catch (error) {
    console.log('[post.cache-getPostCommentsNamesFromCache] : Server error');
    return ServerError("[post.cache-getPostCommentsNamesFromCache] : Server error'");
  }
};

/**
 * getSinglePostCommentFromCache
 * Function used get a specific comment for a post
 */
export const getSinglePostCommentFromCache = async (postId: string, commentId: string): Promise<ICommentDocument[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get all comments for a specific post */
    const comments: string[] = await client.LRANGE(`comments:${postId}`, 0, -1);
    /* Parse all the comments because they are stringified in redis cache */
    const commentsList: ICommentDocument[] = [];
    for (const comment of comments) {
      commentsList.push(JSON.parse(comment));
    }
    /* Search the comment using commentId */
    const commentSearched = commentsList.find((comment: ICommentDocument) => comment._id === commentId);
    return [commentSearched as ICommentDocument];
  } catch (error) {
    console.log('[post.cache-getSinglePostCommentFromCache] : Server error');
    return ServerError("[post.cache-getSinglePostCommentFromCache] : Server error'");
  }
};
