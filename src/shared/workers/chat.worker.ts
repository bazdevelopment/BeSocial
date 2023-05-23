import { DoneCallback, Job } from 'bull';
import { ChatService } from 'shared/services/db/chat.service';

export const ChatWorker = {
  addChatMessageToDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { data } = job;
      await ChatService.addMessageToDb(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  markMessageAsDeletedInDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { messageId, type } = job.data;
      await ChatService.markMessageAsDeletedInDB(messageId, type);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  markMessageAsReadInDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { senderId, receiverId } = job.data;
      await ChatService.markMessagesAsRead(senderId, receiverId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  },
  updateMessageReactionInDB: async (job: Job, done: DoneCallback): Promise<void> => {
    try {
      const { messageId, senderName, reaction, type } = job.data;
      await ChatService.updateMessageReactionInDB({ messageId, senderName, reaction, type });
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error as Error);
    }
  }
};
