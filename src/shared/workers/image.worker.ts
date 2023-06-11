import { DoneCallback, Job } from 'bull';
import { ImageService } from '@src/shared/services/db/image.service';

/**
 * ImageWorker
 */
export const ImageWorker = {
  addProfilePictureToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, url, imgId, imgVersion } = job.data;
      await ImageService.addUserProfilePictureToDB({ userId, url, imgId, imgVersion });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[ImageWorker.addProfilePictureToDB] method fails - ${error}`);
      done(error as Error);
    }
  },
  updateBackgroundImageInDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, url, imgId, imgVersion } = job.data;
      await ImageService.addBackgroundImageToDB({ userId, url, imgId, imgVersion });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[ ImageWorker.updateBackgroundImageInDB method fails - ${error}`);
      done(error as Error);
    }
  },
  addImageToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, imgId, imgVersion } = job.data;
      await ImageService.addImage({ userId, imgId, imgVersion, type: '' });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[ImageWorker.addImageToDB method fails - ${error}`);
      done(error as Error);
    }
  },
  removeImageFromDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { imageId } = job.data;
      await ImageService.removeImageFromDB(imageId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[ImageWorker.removeImageFromDB method fails - ${error}`);
      done(error as Error);
    }
  }
};
