import { createBaseQueue } from './base.queue';
import { IFileImageJobData } from '@src/features/image/interfaces/image.interface';
import { ImageWorker } from '@src/shared/workers/image.worker';

/**
 * Image queue
 */
export const imageQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('IMAGE');

  processJob('addProfilePictureToDB', 5, ImageWorker.addProfilePictureToDB);
  processJob('addImageToDB', 5, ImageWorker.addImageToDB);
  processJob('updateBackgroundImageInDB', 5, ImageWorker.updateBackgroundImageInDB);
  processJob('removeImageFromDB', 5, ImageWorker.removeImageFromDB);

  /** Function used to add the image job into the queue */
  const addImageJob = (jobName: string, data: IFileImageJobData): void => {
    addJobToQueue(jobName, data);
  };
  return { addImageJob };
};
