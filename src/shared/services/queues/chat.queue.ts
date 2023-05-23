import { IChatJobData, IMessageData } from 'features/chat/interfaces/chat.interface';
import { createBaseQueue } from './base.queue';
import { ChatWorker } from 'shared/workers/chat.worker';

/**
 * Chat queue
 */
export const ChatQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('CHAT');

  processJob('addChatMessageToDB', 5, ChatWorker.addChatMessageToDB);
  processJob('markMessageAsDeletedInDB', 5, ChatWorker.markMessageAsDeletedInDB);
  processJob('markMessageAsReadInDB', 5, ChatWorker.markMessageAsReadInDB);
  processJob('updateMessageReactionInDB', 5, ChatWorker.updateMessageReactionInDB);

  /** Function used to add the follow job into the queue*/
  const addChatMessageJob = (jobName: string, data: IChatJobData | IMessageData): void => {
    addJobToQueue(jobName, data);
  };
  return { addChatMessageJob };
};
