import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IReactionJob } from '../interfaces/reaction.interface';
import { ReactionQueue } from 'shared/services/queues/reaction.queue';
import { removePostReactionFromCache } from 'shared/services/redis/reaction.cache';

export const removeReaction = async (req: Request, res: Response): Promise<void> => {
  /* req.params returns only strings */
  const { postId, previousReaction, postReactions } = req.params;

  /* remove post reaction from redis */
  await removePostReactionFromCache({
    key: postId!,
    username: req.currentUser?.username!,
    postReactions: JSON.parse(postReactions!)
  });

  const databaseReactionData: IReactionJob = {
    postId,
    username: req.currentUser?.username!,
    previousReaction
  } as IReactionJob;

  ReactionQueue().addReactionJob('removeReactionFromDB', databaseReactionData);

  res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed successfully!' });
};
