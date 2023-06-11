import { DoneCallback, Job } from 'bull';
import { BLOCK_UNBLOCK_ACTION } from '@src/constants/block-unblock';
import { BlockOrUnblockUserService } from '@src/shared/services/db/block-user.service';

/**
 * Block/unblock worker
 */
export const BlockOrUnblockUserWorker = {
  addBlockedUserToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { loggedInUserId, followerId, type } = job.data;
      if (type === BLOCK_UNBLOCK_ACTION.BLOCK) {
        await BlockOrUnblockUserService.blockUser(loggedInUserId, followerId);
      }
      if (type === BLOCK_UNBLOCK_ACTION.UNBLOCK) {
        await BlockOrUnblockUserService.unblockUser(loggedInUserId, followerId);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(`[BlockOrUnblockUserWorker.addBlockedUserToDB] method fails - ${error}`);
      done(error as Error);
    }
  }
};
