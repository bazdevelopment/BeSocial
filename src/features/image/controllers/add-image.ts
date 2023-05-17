import { Request, Response } from 'express';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { updatePropertyInUserCache } from 'shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';
import { uploadImageToCloudinary } from 'shared/globals/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from 'middleware/error-middleware';
import { getIOInstance } from 'config/socketIO';
import { imageQueue } from 'shared/services/queues/image.queue';
import { IBgUploadResponse } from '../interfaces/image.interface';
import { isBase64Image } from 'shared/globals/helpers/is-base-64-image';

/**
 * addImage controller
 * used for changing the user profile picture
 */
export const addProfilePicture = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();
  const { image } = req.body;
  /** upload image to cloudinary */
  const result: UploadApiResponse = (await uploadImageToCloudinary(image, req.currentUser?.userId, true, true)) as UploadApiResponse;
  if (!result.public_id) {
    return BadRequestError('Image upload:Error occurred. Try again');
  }
  /* update the profilePicture field from user in redis cache */
  const url = `https://res.cloudinary.com/${process.env.CLODINARY_NAME}/image/upload/v${result.version}/${result.public_id}`;
  const cachedUser: IUserDocument = await updatePropertyInUserCache(req.currentUser?.userId!, 'profilePicture', url);
  /* emit an event with the updated user object */
  socketIo.emit('update user profile picture', cachedUser);
  /* add new image to mongoDB database */
  imageQueue().addImageJob('addProfilePictureToDB', {
    userId: req.currentUser?.userId,
    url,
    imgId: result.public_id,
    imgVersion: result.version.toString()
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
};

/**
 * addBackgroundImage controller
 * used for changing the background image for a specific user
 */
export const addBackgroundImage = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();
  const { image } = req.body;

  if (!req.currentUser?.userId) {
    return BadRequestError('Invalid userId.');
  }
  /* get the versionId and publicId */
  const { version, publicId }: IBgUploadResponse = await backgroundImageUpload(image);
  /* update the bgImageId field from user object from redis cache*/
  const bgImageId: Promise<IUserDocument> = updatePropertyInUserCache(
    req.currentUser.userId,
    'bgImageId',
    publicId
  ) as Promise<IUserDocument>;
  /* update the bgImageVersion field from user object from redis cache*/
  const bgImageVersion: Promise<IUserDocument> = updatePropertyInUserCache(
    req.currentUser.userId,
    'bgImageVersion',
    version
  ) as Promise<IUserDocument>;

  const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);
  /* emit an event */
  socketIo.emit('update user background image', {
    bgImageId: publicId,
    bgImageVersion: version,
    userId: response[0]
  });
  /* update the background image in mongoDB database */
  imageQueue().addImageJob('updateBackgroundImageInDB', {
    userId: req.currentUser.userId,
    imgId: publicId,
    imgVersion: version.toString()
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Background image added successfully' });
};
/* helper function used to check if the image is base64 or plain URL format and return publicId and version */
async function backgroundImageUpload(imageUrl: string): Promise<IBgUploadResponse> {
  const isBase64 = isBase64Image(imageUrl);
  let version = '';
  let publicId = '';
  if (isBase64) {
    const result: UploadApiResponse = (await uploadImageToCloudinary(imageUrl)) as UploadApiResponse;
    if (!result.public_id) {
      return BadRequestError(result.message);
    } else {
      version = result.version.toString();
      publicId = result.public_id;
    }
  } else {
    const imageValue = imageUrl.split('/');
    version = imageValue[imageValue.length - 2] as string;
    publicId = imageValue[imageValue.length - 1] as string;
  }
  return { version: version.replace(/v/g, ''), publicId };
}
