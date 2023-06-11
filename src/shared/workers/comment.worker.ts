import { DoneCallback, Job } from 'bull';
import { CommentService } from '@src/shared/services/db/comment.service';

export const CommentWorker = {
  addCommentToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { data } = job;
      await CommentService.addCommentToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  }
};
