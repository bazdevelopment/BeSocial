export const BLOCK_UNBLOCK_ACTION = {
  BLOCK: 'BLOCK',
  UNBLOCK: 'UNBLOCK'
} as const;

export type BlockUnblockActionType = keyof typeof BLOCK_UNBLOCK_ACTION;
