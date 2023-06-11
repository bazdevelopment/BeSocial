import { IAuthJob } from '@src/features/auth/interfaces/auth.interface';
import { AuthWorker } from '@src/shared/workers/auth.worker';
import { createBaseQueue } from './base.queue';

/**
 * Auth queue
 */
export const authQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('AUTH');

  processJob('addAuthUserToDB', 5, AuthWorker.addAuthUserToDB);
  /**
   * Function used to add the auth user job into the queue
   */
  const addAuthUserJob = (jobName: string, data: IAuthJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addAuthUserJob };
};
