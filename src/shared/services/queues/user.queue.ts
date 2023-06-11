import { IUserJob, IUserJobInfo } from '@src/features/user/interfaces/user.interface';
import { UserWorker } from '@src/shared/workers/user.worker';
import { createBaseQueue } from './base.queue';

/**
 * User queue
 */
export const userQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('USER');

  processJob('addUserToDB', 5, UserWorker.addUserToDB);
  processJob('updateUserBasicInfo', 5, UserWorker.updateUserBasicInfo);
  processJob('updateUserSocialLinks', 5, UserWorker.updateUserSocialLinks);
  processJob('updateUserNotificationSettings', 5, UserWorker.updateUserNotificationSettings);

  /** Function used to add the user job into the queue*/
  const addUserJob = (jobName: string, data: IUserJob | IUserJobInfo): void => {
    addJobToQueue(jobName, data);
  };
  return { addUserJob };
};
