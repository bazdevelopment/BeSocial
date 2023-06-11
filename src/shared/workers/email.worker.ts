import { DoneCallback, Job } from 'bull';
import { sendEmail } from '@src/shared/services/emails/mail.transport';

/**
 * Email worker used to call services for sending email functionality
 */
export const EmailWorker = {
  addNotificationEmail: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { template, receiverEmail, subject } = job.data;
      await sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[UserWorker.addUserToDB] method fails - ${error}`);
      done(error as Error);
    }
  }
};
