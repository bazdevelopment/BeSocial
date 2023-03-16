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
  }
};
