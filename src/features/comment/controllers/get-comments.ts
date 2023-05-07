import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose, { ObjectId } from 'mongoose';
import { ICommentDocument, ICommentNameList } from '../interfaces/comment.interface';
import {
  getPostCommentsFromCache,
  getPostCommentsNamesFromCache,
  getSinglePostCommentFromCache
} from 'shared/services/redis/comment.cache';
import { CommentService } from 'shared/services/db/comment.service';

/**
 * getCommentsForPost controller
 * get all the comments for a post, either from redis cache or directly from mongodb
 */
export const getCommentsForPost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }

  const cachedComments: ICommentDocument[] = await getPostCommentsFromCache(postId);

  const comments: ICommentDocument[] = cachedComments.length
    ? cachedComments
    : await CommentService.getPostCommentsFromDB({ postId: new mongoose.Types.ObjectId(postId) as unknown as ObjectId }, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: 'Successfully fetched post comments!', comments });
};

/**
 * getCommentsPostUserNames controller
 * get all the user names that added a comment to a specific post
 */
export const getCommentsPostUserNames = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  const cachedCommentsUserNames: ICommentNameList[] = await getPostCommentsNamesFromCache(postId);

  const commentsUserNames: ICommentNameList[] = cachedCommentsUserNames.length
    ? cachedCommentsUserNames
    : await CommentService.getPostCommentsUserNamesFromDB(
        { postId: new mongoose.Types.ObjectId(postId) as unknown as ObjectId },
        { createdAt: -1 }
      );

  res
    .status(HTTP_STATUS.OK)
    .json({ message: `Successfully fetched user names that added a comment to ${postId} post!`, comments: commentsUserNames });
};

/**
 * getSingleComment controller
 * get a specific comment for a post using commentId and postId
 */
export const getSingleComment = async (req: Request, res: Response): Promise<void> => {
  const { postId, commentId } = req.params;
  if (!postId || !commentId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }

  const cachedComments: ICommentDocument[] = await getSinglePostCommentFromCache(postId, commentId);

  const comments: ICommentDocument[] = cachedComments.length
    ? cachedComments
    : await CommentService.getPostCommentsFromDB({ _id: new mongoose.Types.ObjectId(commentId) as unknown as ObjectId }, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: `Successfully fetched the comment ${commentId} from ${postId} post!`, comments });
};
