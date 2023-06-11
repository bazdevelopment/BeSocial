import { getIOInstance } from '@src/config/socketIO';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { PostQueue } from '@src/shared/services/queues/post.queue';
import { deletePostFromCache } from '@src/shared/services/redis/post.cache';

/**
 * This function is designed to fetch a list of posts with images from a cache or a database, based on the requested page number and a query
 */

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();
  socketIo.emit('delete post', req.params.postId);
  await deletePostFromCache(req.params.postId!, req.currentUser?.userId!);
  PostQueue().addPostJob('deletePostFromDB', { postId: req.params.postId, userId: req.currentUser?.userId });
  res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully! ✅' });
};
