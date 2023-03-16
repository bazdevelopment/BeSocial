import { DoneCallback, Job } from 'bull';
import { AuthService } from 'shared/services/db/auth.service';

export const AuthWorker = {
  addAuthUserToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { value } = job.data;
      await AuthService.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  }
};
