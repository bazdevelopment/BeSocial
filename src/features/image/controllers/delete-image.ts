import { Request, Response } from 'express';
import { IUserDocument } from '@src/features/user/interfaces/user.interface';
import { updatePropertyInUserCache } from '@src/shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';
import { getIOInstance } from '@src/config/socketIO';
import { imageQueue } from '@src/shared/services/queues/image.queue';
import { ImageService } from '@src/shared/services/db/image.service';
import { BadRequestError } from '@src/middleware/error-middleware';

/**
 * deleteProfilePicture controller
 * used to remove the profile picture for a specific user
 */
export const deleteProfilePicture = (req: Request, res: Response): void => {
  const socketIo = getIOInstance();
  const { imageId } = req.params;
  socketIo.emit('delete profile picture', imageId);
  /*remove profile picture also from mongoDB */
  imageQueue().addImageJob('removeImageFromDB', {
    imageId
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Profile picture deleted successfully' });
};

/**
 * deleteBackgroundImage controller
 * used to delete background image for a specific user
 */
export const deleteBackgroundImage = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();

  const { bgImageId } = req.params;

  if (!req.currentUser?.userId || !bgImageId) {
    return BadRequestError('Invalid request parameters.');
  }
  /* get the background image */
  const image = await ImageService.getImageByBackgroundId(bgImageId);
  socketIo.emit('delete profile picture', image._id);
  /* clear the bgImageField  from redis cache*/
  const removeBgImageId: Promise<IUserDocument> = updatePropertyInUserCache(
    req.currentUser.userId,
    'bgImageId',
    ''
  ) as Promise<IUserDocument>;
  /* clear the bgImageVersionField from redis cache */
  const removeBgImageVersion: Promise<IUserDocument> = updatePropertyInUserCache(
    req.currentUser.userId,
    'bgImageVersion',
    ''
  ) as Promise<IUserDocument>;

  await Promise.all([removeBgImageId, removeBgImageVersion]);
  /* remove the background image from mongoDB*/
  imageQueue().addImageJob('removeImageFromDB', { imageId: image._id });

  res.status(HTTP_STATUS.OK).json({ message: 'Background image deleted successfully' });
};
