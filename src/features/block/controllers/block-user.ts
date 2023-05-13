import { Request, Response } from 'express';
import { updateBlockedUserInCache } from 'shared/services/redis/follower.cache';
import HTTP_STATUS from 'http-status-codes';

import { BlockedUserQueue } from 'shared/services/queues/blocked.queue';
import { BLOCK_UNBLOCK_ACTION, BlockUnblockActionType } from 'constants/block-unblock';
/**
 * blockUser
 * controller used for blocking a specific user
 */
export const blockUser = async (req: Request, res: Response): Promise<void> => {
  const { followerId } = req.params;
  if (!followerId || !req.currentUser?.userId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  await updateBlockedUser(followerId, req.currentUser.userId, BLOCK_UNBLOCK_ACTION.BLOCK);
  BlockedUserQueue().addBlockOrUnblockUserJob('addBlockedUserToDB', {
    loggedInUserId: req.currentUser.userId,
    followerId: followerId,
    type: BLOCK_UNBLOCK_ACTION.BLOCK
  });

  res.status(HTTP_STATUS.OK).json({ message: 'User blocked!' });
};

/**
 * unblockUser
 * controller used for unblocking a specific user
 */
export const unblockUser = async (req: Request, res: Response): Promise<void> => {
  const { followerId } = req.params;
  if (!followerId || !req.currentUser?.userId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  await updateBlockedUser(followerId, req.currentUser.userId, BLOCK_UNBLOCK_ACTION.UNBLOCK);
  BlockedUserQueue().addBlockOrUnblockUserJob('addBlockedUserToDB', {
    loggedInUserId: req.currentUser.userId,
    followerId: followerId,
    type: BLOCK_UNBLOCK_ACTION.UNBLOCK
  });

  res.status(HTTP_STATUS.OK).json({ message: 'User unblocked!' });
};
/**
 * Utility function used to update the 'blocked' and 'blockedBy' properties from user info
 */
async function updateBlockedUser(followerId: string, userId: string, actionType: BlockUnblockActionType) {
  const blocked: Promise<void> = updateBlockedUserInCache({
    userId,
    actionType,
    propertyName: 'blocked',
    propertyValue: followerId
  });

  const blockedBy: Promise<void> = updateBlockedUserInCache({
    userId: followerId,
    actionType,
    propertyName: 'blockedBy',
    propertyValue: userId
  });

  await Promise.all([blocked, blockedBy]);
}
