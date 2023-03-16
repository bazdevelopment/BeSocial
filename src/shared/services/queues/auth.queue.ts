import { IAuthJob } from 'features/auth/interfaces/auth.interface';
import { AuthWorker } from 'shared/workers/auth.worker';
import { createBaseQueue } from './base.queue';

export const authQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('AUTH');

  processJob('addAuthUserToDB', 5, AuthWorker.addAuthUserToDB);

  const addAuthUserJob = (jobName: string, data: IAuthJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addAuthUserJob };
};
