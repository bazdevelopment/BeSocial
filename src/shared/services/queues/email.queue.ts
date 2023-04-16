import { IEmailJob } from 'features/user/interfaces/user.interface';
import { EmailWorker } from 'shared/workers/email.worker';
import { createBaseQueue } from './base.queue';

/**
 * Email queue
 */
export const emailQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('EMAIL');

  processJob('forgotUserPassword', 5, EmailWorker.addNotificationEmail);

  /** Function used to add the email job into the queue*/
  const addEmailJob = (jobName: string, data: IEmailJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addEmailJob };
};
