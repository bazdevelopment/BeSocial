import { createBaseQueue } from './base.queue';
import { FollowerWorker } from 'shared/workers/follower.worker';
import { IFollowerJobData } from 'features/follower/interface/follower.interface';

/**
 * Follow queue
 */
export const followQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('FOLLOW');

  processJob('addFollowerToDB', 5, FollowerWorker.addFollowerToDB);
  processJob('removeFollowerFromDB', 5, FollowerWorker.removeFollowerFromDB);

  /** Function used to add the follow job into the queue*/
  const addFollowJob = (jobName: string, data: IFollowerJobData): void => {
    addJobToQueue(jobName, data);
  };
  return { addFollowJob };
};
