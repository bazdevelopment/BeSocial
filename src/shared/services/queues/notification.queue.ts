import { createBaseQueue } from './base.queue';
import { INotificationJobData } from '@src/features/notification/interfaces/notification.interface';
import { NotificationWorker } from '@src/shared/workers/notification.worker';

/**
 * Notification queue
 */
export const NotificationQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('NOTIFICATION');

  processJob('readNotification', 5, NotificationWorker.readNotification);
  processJob('deleteNotification', 5, NotificationWorker.deleteNotification);

  /**
   * Function used to add the notification job into the queue
   */
  const addNotificationJob = (jobName: string, data: INotificationJobData): void => {
    addJobToQueue(jobName, data);
  };
  return { addNotificationJob };
};
