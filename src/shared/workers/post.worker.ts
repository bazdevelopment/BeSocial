import { DoneCallback, Job } from 'bull';
import { PostService } from 'shared/services/db/post.service';

export const PostWorker = {
  addPostToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { key, value } = job.data;
      await PostService.addPostToDb(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  deletePostFromDb: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { postId, userId } = job.data;
      await PostService.deletePost(postId, userId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  updatePostInDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { postId, updatedPost } = job.data;
      await PostService.updatePost(postId, updatedPost);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  }
};
