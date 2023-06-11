import { DoneCallback, Job } from 'bull';
import { ReactionService } from '@src/shared/services/db/reaction.service';

export const ReactionWorker = {
  addReactionToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { data } = job;
      await ReactionService.addReactionDataToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  removeReactionFromDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { data } = job;
      await ReactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  }
};
