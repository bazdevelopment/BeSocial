import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import mongoose, { ObjectId } from 'mongoose';
import { ReactionService } from '@src/shared/services/db/reaction.service';
import { getReactionsFromCache, getSingleReactionByUsernameFromCache } from '@src/shared/services/redis/reaction.cache';
import { IReactionDocument } from '../interfaces/reaction.interface';

/**
 * getReactionsForParticularPost controller for getting all the reactions for a praticular posts
 */
export const getReactionsForParticularPost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const cachedReactions: { reactions: IReactionDocument[]; numberOfReactions: number } = postId
    ? await getReactionsFromCache(postId)
    : { reactions: [], numberOfReactions: 0 };

  const reactions: { reactions: IReactionDocument[]; numberOfReactions: number } = cachedReactions.reactions.length
    ? cachedReactions
    : await ReactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) as unknown as ObjectId }, { createdAt: -1 });

  res
    .status(HTTP_STATUS.OK)
    .json({ message: 'Get post reactions successfully!', reactions: reactions.reactions, numberOfReactions: reactions.numberOfReactions });
};

/**
 * getReactionsForParticularPost controller for getting all the reactions for a praticular posts
 */
export const getSingleReactionByUsername = async (req: Request, res: Response): Promise<void> => {
  const { postId, username } = req.params;
  const cachedReactions: { reactions: IReactionDocument; numberOfReactions: number } = await getSingleReactionByUsernameFromCache(
    postId ?? '',
    username ?? ''
  );

  const reactionsList: { reactions: IReactionDocument[]; numberOfReactions: number } = (
    cachedReactions.reactions ? cachedReactions : await ReactionService.getSinglePostReactionByUsername(postId ?? '', username ?? '')
  ) as { reactions: IReactionDocument[]; numberOfReactions: number };

  res.status(HTTP_STATUS.OK).json({
    message: 'Get single post post reaction bt username successfully!',
    reactions: reactionsList.reactions,
    numberOfReactions: reactionsList.numberOfReactions
  });
};

/**
 * getReactionsForParticularPost controller for getting all the reactions for a particular posts
 * ! you can use this for displaying recent activity of the users based on reaction
 */
export const getReactionsByUsername = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  const reactions: IReactionDocument[] = !!username ? await ReactionService.getReactionsByUsername(username) : [];

  res.status(HTTP_STATUS.OK).json({
    message: 'All user reactions by username !',
    reactions,
    numberOfReactions: reactions.length
  });
};
