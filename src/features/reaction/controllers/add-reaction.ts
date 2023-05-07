import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IReactionDocument, IReactionJob } from '../interfaces/reaction.interface';
import { savePostReactionToCache } from 'shared/services/redis/reaction.cache';
import { ReactionQueue } from 'shared/services/queues/reaction.queue';

export const addReaction = async (req: Request, res: Response): Promise<void> => {
  const { postId, type, userTo, previousReaction, postReactions, profilePicture } = req.body;
  const reaction: IReactionDocument = {
    postId,
    type,
    avatarColor: req.currentUser?.avatarColor!,
    username: req.currentUser?.username!,
    profilePicture
  } as unknown as IReactionDocument;

  await savePostReactionToCache({ key: postId, reaction, postReactions, type, previousReaction });

  const databaseReactionData: IReactionJob = {
    postId,
    userTo,
    userFrom: req.currentUser?.userId,
    username: req.currentUser?.username!,
    type,
    previousReaction,
    reactionObject: reaction
  };

  ReactionQueue().addReactionJob('addReactionToDb', databaseReactionData);

  res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully!' });
};
