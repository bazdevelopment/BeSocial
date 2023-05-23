import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IMessageData } from '../interfaces/chat.interface';
import { getUserConversationListFromCache } from 'shared/services/redis/chat.cache';
import { ChatService } from 'shared/services/db/chat.service';
import mongoose from 'mongoose';

/**
 * getChatConversationMessage
 * get the last message between 2 users
 */
export const getChatConversationMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.currentUser) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'There is no logged in user.' });
    return;
  }
  const cachedList: IMessageData[] = await getUserConversationListFromCache(req.currentUser.userId);
  const list: IMessageData[] = cachedList.length
    ? cachedList
    : await ChatService.getUserConversationList(new mongoose.Types.ObjectId(req.currentUser.userId));

  res.status(HTTP_STATUS.OK).json({ message: 'User conversationList', list });
};
