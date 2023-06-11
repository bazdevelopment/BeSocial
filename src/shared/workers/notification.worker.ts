import { DoneCallback, Job } from 'bull';
import { NotificationService } from '@src/shared/services/db/notification.service';

/**
 * Notification worker
 */
export const NotificationWorker = {
  readNotification: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { notificationId } = job.data;
      await NotificationService.readNotification(notificationId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[NotificationWorker.readNotification method fails - ${error}`);
      done(error as Error);
    }
  },
  deleteNotification: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { notificationId } = job.data;
      await NotificationService.deleteNotification(notificationId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[NotificationWorker.deleteNotification] method fails - ${error}`);
      done(error as Error);
    }
  }
};
