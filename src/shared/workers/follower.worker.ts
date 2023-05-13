import { DoneCallback, Job } from 'bull';
import { FollowService } from 'shared/services/db/follower.service';

/**
 * FollowerWorker
 */
export const FollowerWorker = {
  addFollowerToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { userId, followeeId, username, followerDocumentId } = job.data;
      await FollowService.addFollowerToDB({ userId, followeeId, username, followerDocumentId });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[FollowerWorker.addFollowerToDB] method fails - ${error}`);
      done(error as Error);
    }
  },
  removeFollowerFromDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { followeeId, userId } = job.data;
      await FollowService.removeFollowerFromDB(followeeId, userId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[FollowerWorker.removeFollowerFromDB] method fails - ${error}`);
      done(error as Error);
    }
  }
};
