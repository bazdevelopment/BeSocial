import { IUserJob } from 'features/user/interfaces/user.interface';
import { UserWorker } from 'shared/workers/user.worker';
import { createBaseQueue } from './base.queue';

export const userQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('USER');

  processJob('addUserToDB', 5, UserWorker.addUserToDB);

  const addUserJob = (jobName: string, data: IUserJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addUserJob };
};
