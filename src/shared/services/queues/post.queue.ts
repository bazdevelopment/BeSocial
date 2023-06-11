import { createBaseQueue } from './base.queue';
import { IPostJobData } from '@src/features/post/interfaces/post.interface';
import { PostWorker } from '@src/shared/workers/post.worker';

type AddPostJobFn = (jobName: string, data: IPostJobData) => void;

type PostQueueReturnType = {
  addPostJob: AddPostJobFn;
};
/**
 * Post queue
 */
export const PostQueue = (): PostQueueReturnType => {
  const { addJobToQueue, processJob } = createBaseQueue('POST');

  processJob('addPostToDB', 5, PostWorker.addPostToDB);
  processJob('deletePostFromDB', 5, PostWorker.deletePostFromDb);
  processJob('updatePostInDB', 5, PostWorker.updatePostInDB);
  /**
   * Function used to add the post job into the queue
   */
  const addPostJob = (jobName: string, data: IPostJobData): void => {
    addJobToQueue(jobName, data);
  };
  return { addPostJob };
};
