import { DoneCallback, Job } from 'bull';
import { UserService } from 'shared/services/db/user.service';

export const UserWorker = {
  addUserToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { value } = job.data;
      await UserService.createUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[UserWorker.addUserToDB] method fails - ${error}`);
      done(error as Error);
    }
  },
  updateUserBasicInfo: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, fields } = job.data;
      await UserService.updateBasicUserInfo(userId, fields);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[UserWorker.updateUserBasicInfo] method fails - ${error}`);
      done(error as Error);
    }
  },
  updateUserSocialLinks: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, fields } = job.data;
      await UserService.updateUserSocialLinks(userId, fields);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[UserWorker.updateUserSocialLinks] method fails - ${error}`);
      done(error as Error);
    }
  },
  updateUserNotificationSettings: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, fields } = job.data;
      await UserService.updateUserNotificationSettings(userId, fields);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[updateUserNotificationSettings] method fails - ${error}`);
      done(error as Error);
    }
  }
};
