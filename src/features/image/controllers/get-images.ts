import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ImageService } from '@src/shared/services/db/image.service';
import { IFileImageDocument } from '../interfaces/image.interface';
import { BadRequestError } from '@src/middleware/error-middleware';

/**
 * getImages controller
 * fetch all the user images from mongoDB database
 * !we do not store images in redis cache
 */
export const getImages = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId) {
    return BadRequestError('Invalid request parameters.');
  }

  const images: IFileImageDocument[] = await ImageService.getImages(userId);

  res.status(HTTP_STATUS.OK).json({ message: 'Fetched user images', images });
};
