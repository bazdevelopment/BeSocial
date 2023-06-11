import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '../interfaces/post.interface.js';
import { ObjectId } from 'mongodb';
import { savePostToCache } from '@src/shared/services/redis/post.cache';
import { getIOInstance } from '@src/config/socketIO';
import { PostQueue } from '@src/shared/services/queues/post.queue';
import { uploadImageToCloudinary } from '@src/shared/globals/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@src/middleware/error-middleware';
import { imageQueue } from '@src/shared/services/queues/image.queue';

/**
 * createPost controller used to create a basic post without an image
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, gifUrl, feelings, privacy, profilePicture } = req.body;
  const postObjectId: ObjectId = new ObjectId();
  const socketIo = getIOInstance();

  const createdPost: IPostDocument = {
    _id: postObjectId,
    userId: req.currentUser?.userId,
    username: req.currentUser?.username,
    email: req.currentUser?.email,
    avatarColor: req.currentUser?.avatarColor,
    profilePicture,
    post,
    bgColor,
    gifUrl,
    feelings,
    privacy,
    commentsCount: 0,
    imgVersion: '',
    imgId: '',
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
  } as IPostDocument;
  socketIo.emit('add post', createdPost);
  /**Prepare data for redis cache */
  await savePostToCache(createdPost);
  /**Add new post into the job queue*/
  PostQueue().addPostJob('addPostToDB', { key: req.currentUser?.userId, value: createdPost });

  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully! ✅' });
};
/**
 * createPostWithImage - controller used to create a post with an image
 */
export const createPostWithImage = async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, gifUrl, feelings, privacy, profilePicture, image } = req.body;

  /* Upload post image to cloudinary */
  const uploadImageResult: UploadApiResponse = (await uploadImageToCloudinary(image)) as UploadApiResponse;
  if (!uploadImageResult?.public_id) {
    BadRequestError(uploadImageResult.message);
  }

  const postObjectId: ObjectId = new ObjectId();
  const socketIo = getIOInstance();

  const createdPost: IPostDocument = {
    _id: postObjectId,
    userId: req.currentUser?.userId,
    username: req.currentUser?.username,
    email: req.currentUser?.email,
    avatarColor: req.currentUser?.avatarColor,
    profilePicture,
    post,
    bgColor,
    gifUrl,
    feelings,
    privacy,
    commentsCount: 0,
    imgVersion: uploadImageResult.version.toString(),
    imgId: uploadImageResult.public_id,
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
  } as IPostDocument;
  socketIo.emit('add post', createdPost);
  /**Prepare data for redis cache */
  await savePostToCache(createdPost);
  /**Add new post into the job queue*/
  PostQueue().addPostJob('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
  /**Add new post image to mongoDB Image collection*/
  imageQueue().addImageJob('addImageToDB', {
    userId: req.currentUser?.userId,
    imgId: uploadImageResult.public_id,
    imgVersion: uploadImageResult.version.toString()
  });

  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully! ✅' });
};
