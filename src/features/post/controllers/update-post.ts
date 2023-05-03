import { getIOInstance } from 'config/socketIO';
import { Request, Response } from 'express';
import { IPostDocument } from '../interfaces/post.interface';
import { updatePostInCache } from 'shared/services/redis/post.cache';
import { PostQueue } from 'shared/services/queues/post.queue';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { uploadImageToCloudinary, uploadVideoToCloudinary } from 'shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from 'middleware/error-middleware';

/* Helper for uploading an image to cloudinary */
const uploadImage = async (image: string) => (await uploadImageToCloudinary(image)) as UploadApiResponse;
/* Helper for uploading an video to cloudinary */
const uploadVideo = async (video: string) => (await uploadVideoToCloudinary(video)) as UploadApiResponse;

/**
 * Function for updating a post without an image based on postId
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();

  const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = req.body;
  const { postId } = req.params;
  const updatedPost: IPostDocument = {
    post,
    bgColor,
    feelings,
    privacy,
    gifUrl,
    imgVersion,
    imgId,
    videoId,
    videoVersion,
    profilePicture
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId!, updatedPost);
  socketIo.emit('update post', postUpdated, 'posts');
  PostQueue().addPostJob('updatePostInDB', { postId, updatedPost: postUpdated });

  res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully! ✅' });
};

/**
 * Function for updating a post with an image based on postId
 */
export const updatePostWithImage = async (req: Request, res: Response): Promise<void> => {
  const { imgId, imgVersion } = req.body;
  if (imgId && imgVersion) {
    updatePostUtil(req);
  }
  const result: UploadApiResponse = await addImageToExistingPost(req);
  if (!result.public_id) {
    return BadRequestError(result.message);
  }
  res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully ✅' });
};
/**
 * Function for updating a post with a vide based on videoId
 */
export const updatePostWithVideo = async (req: Request, res: Response): Promise<void> => {
  const { videoId, videoVersion } = req.body;
  if (videoId && videoVersion) {
    updatePostUtil(req);
  } else {
    const result: UploadApiResponse = await addImageToExistingPost(req);
    if (!result.public_id) {
      BadRequestError(result.message);
    }
  }
  res.status(HTTP_STATUS.OK).json({ message: 'Post with vide updated successfully ✅' });
};
/**
 * Utility for updating a post
 */
async function updatePostUtil(req: Request): Promise<void> {
  const socketIo = getIOInstance();
  const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, videoId, videoVersion } = req.body;
  const { postId } = req.params;

  const updatedPost: IPostDocument = {
    post,
    bgColor,
    privacy,
    feelings,
    gifUrl,
    profilePicture,
    imgId: imgId ? imgId : '',
    imgVersion: imgVersion ? imgVersion : '',
    videoId: videoId ? videoId : '',
    videoVersion: videoVersion ? videoVersion : ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId!, updatedPost);
  socketIo.emit('update post', postUpdated, 'posts');
  PostQueue().addPostJob('updatePostInDB', { postId, updatedPost: postUpdated });
}
/**
 * Utility for updating a post with images
 */
async function addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
  //TODO :!rename this function since it handles both scenarios with image/video
  const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, video } = req.body;
  const { postId } = req.params;
  const socketIo = getIOInstance();

  const result: UploadApiResponse = image ? await uploadImage(image) : await uploadVideo(video);
  if (!result.public_id) {
    return result;
  }

  const updatedPost: IPostDocument = {
    post,
    bgColor,
    privacy,
    feelings,
    gifUrl,
    profilePicture,
    imgId: image ? result.public_id : '',
    imgVersion: image ? result.version.toString() : '',
    videoId: video ? result.public_id : '',
    videoVersion: video ? result.version.toString() : ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId!, updatedPost);

  socketIo.emit('update post', postUpdated, 'posts');
  PostQueue().addPostJob('updatePostInDB', { postId, updatedPost: postUpdated });

  /**Todo */
  // if(image){
  //   ImageQueue.addImageJob
  // }

  return result;
}
