import { createBaseQueue } from './base.queue';
import { ICommentJob } from 'features/comment/interfaces/comment.interface';
import { CommentWorker } from 'shared/workers/comment.worker';

/**
 * Comment queue
 */
export const CommentQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('COMMENT');

  processJob('addCommentToDB', 5, CommentWorker.addCommentToDB);

  /**
   * Function used to add the comment job into the queue
   */
  const addCommentJob = (jobName: string, data: ICommentJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addCommentJob };
};
