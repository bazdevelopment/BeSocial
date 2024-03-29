import { Request, Response } from 'express';
import { getChatMessagesFromCache } from '@src/shared/services/redis/chat.cache';
import { IMessageData } from '../interfaces/chat.interface';
import { ChatService } from '@src/shared/services/db/chat.service';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

/**
 *  getChatMessages
 * controller used to fetch all the messages between 2 users
 */
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  const { receiverId } = req.params;
  if (!req.currentUser || !receiverId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }

  /* fetch the images from redis cache */
  const cachedList: IMessageData[] = await getChatMessagesFromCache(req.currentUser?.userId, receiverId);
  /* if there are not messages in cached then the messages will be fetched from mongoDB */
  const messages: IMessageData[] = cachedList.length
    ? cachedList
    : await ChatService.getChatMessages(new mongoose.Types.ObjectId(req.currentUser?.userId), new mongoose.Types.ObjectId(receiverId), {
        createAt: 1
      });

  res.status(HTTP_STATUS.OK).json({ message: 'User chat messages successfully fetched', messages });
};
