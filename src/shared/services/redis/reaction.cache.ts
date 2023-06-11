import { IReactionDocument, IReactions } from '@src/features/reaction/interfaces/reaction.interface';
import { getRedisClient } from './redis.connection';
import { ServerError } from '@src/middleware/error-middleware';

/**
 * Method used to save post reaction to redis cache
 */
export const savePostReactionToCache = async ({
  key,
  reaction,
  postReactions,
  type,
  previousReaction
}: {
  key: string;
  reaction: IReactionDocument;
  postReactions: IReactions;
  type: string;
  previousReaction: string;
}): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    if (previousReaction) {
      await removePostReactionFromCache({ key, username: reaction.username, postReactions });
      /*In case that there is a reaction already set we should remove the previous reaction */
    }
    if (type) {
      /*In case that there is a new reaction, save it to the redis cache*/
      await client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
      await client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    }
  } catch (error) {
    console.log('[reaction.cache-savePostReactionToCache] : Server error');
    ServerError("[reaction.cache-savePostReactionToCache] : Server error'");
  }
};

/**
 * Method used to remove post reaction to redis cache ad update with a new one
 */
export const removePostReactionFromCache = async ({
  key,
  username,
  postReactions
}: {
  key: string;
  username: string;
  postReactions: IReactions;
}): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* Get all reactions from redis cache */
    const allReactions = await client.LRANGE(`reactions:${key}`, 0, -1);
    /* Find the reaction  */
    const userPreviousReaction = getPreviousReaction(allReactions, username);
    /* remove the previous reaction */
    await client.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
    /*update again the reactions field from posts */
    await client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
  } catch (error) {
    console.log('[reaction.cache-removePostReactionFromCache] : Server error');
    ServerError("[reaction.cache-removePostReactionFromCache] : Server error'");
  }
};

/**
 * Method used to get the reactions from redis DB for a specific post
 * !consider using pagination in the future
 */
export const getReactionsFromCache = async (postId: string): Promise<{ reactions: IReactionDocument[]; numberOfReactions: number }> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const reactionsCount: number = await client.LLEN(`reactions:${postId}`);
    const response: string[] = await client.LRANGE(`reactions:${postId}`, 0, 1);
    const reactionsList: IReactionDocument[] = [];
    for (const reaction of response) {
      reactionsList.push(JSON.parse(reaction));
    }
    return response.length ? { reactions: reactionsList, numberOfReactions: reactionsCount } : { reactions: [], numberOfReactions: 0 };
  } catch (error) {
    console.log('getReactionsFromCache] : Server error');
    return ServerError('getReactionsFromCache] : Server error');
  }
};

/**
 * Method used to get the reactions for a particular user to a post
 */
export const getSingleReactionByUsernameFromCache = async (
  postId: string,
  username: string
): Promise<{ reactions: IReactionDocument; numberOfReactions: number }> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const response: string[] = await client.LRANGE(`reactions:${postId}`, 0, 1);
    const reactionsList: IReactionDocument[] = [];
    for (const reaction of response) {
      reactionsList.push(JSON.parse(reaction));
    }
    const result: IReactionDocument = reactionsList.find(
      (reaction: IReactionDocument) => reaction.postId === postId && reaction.username === username
    ) as IReactionDocument;
    return { reactions: result || [], numberOfReactions: result ? 1 : 0 };
  } catch (error) {
    console.log('getReactionsFromCache] : Server error');
    return ServerError('getReactionsFromCache] : Server error');
  }
};

/**
 * Utility used to find the reaction based on username
 */
const getPreviousReaction = (reactions: string[], username: string): IReactionDocument | undefined => {
  const reactionsList: IReactionDocument[] = [];
  for (const reaction of reactions) {
    reactionsList.push(JSON.parse(reaction));
  }
  return reactionsList.find((reaction: IReactionDocument) => reaction.username === username);
};
