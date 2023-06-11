import { createBaseQueue } from './base.queue';
import { IBlockedUserJobData } from '@src/features/follower/interface/follower.interface';
import { BlockOrUnblockUserWorker } from '@src/shared/workers/blocked.worker';

/**
 * Blocked queue
 */
export const BlockedUserQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('BLOCK-UNBLOCK');

  processJob('addBlockedUserToDB', 5, BlockOrUnblockUserWorker.addBlockedUserToDB);
  processJob('removeBlockedUserFromDB', 5, BlockOrUnblockUserWorker.addBlockedUserToDB);

  /** Function used to add the follow job into the queue*/
  const addBlockOrUnblockUserJob = (jobName: string, data: IBlockedUserJobData): void => {
    addJobToQueue(jobName, data);
  };
  return { addBlockOrUnblockUserJob };
};
