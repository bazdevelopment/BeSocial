/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentJob } from '../interfaces/comment.interface';
import { ObjectId } from 'mongodb';
import { savePostCommentToCache } from '@src/shared/services/redis/comment.cache';
import { CommentQueue } from '@src/shared/services/queues/comment.queue';
/**
 * AddComment controller
 * user to create a new comment for a post and add it to the redis cache/mongoDB
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  const { userTo, postId, comment, profilePicture } = req.body;

  const commentData: ICommentDocument = {
    _id: new ObjectId(),
    postId,
    username: req.currentUser?.username,
    avatarColor: req.currentUser?.avatarColor,
    profilePicture,
    createdAt: new Date(),
    comment
  } as unknown as ICommentDocument;
  /* Save post comment to redis cache */
  await savePostCommentToCache(postId, JSON.stringify(commentData));

  const databaseCommentData: ICommentJob = {
    postId,
    userTo,
    userFrom: req.currentUser?.userId!,
    username: req.currentUser?.username!,
    comment: commentData
  };
  /* Save post comment to mongoDB database */
  CommentQueue().addCommentJob('addCommentToDB', databaseCommentData);
  res.status(HTTP_STATUS.OK).json({ message: 'Comment added successfully!' });
};
