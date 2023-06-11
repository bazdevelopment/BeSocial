import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IMessageData } from '../interfaces/chat.interface';
import { markMessagesAsRead } from '@src/shared/services/redis/chat.cache';
import { getIOInstance } from '@src/config/socketIO';
import { ChatQueue } from '@src/shared/services/queues/chat.queue';
import mongoose from 'mongoose';
/**
 * readChatMessages
 * controller used to mark all the messages read
 * !scenario: all the messages byDefault will have isRead property set to false. So when 2 users are on the same conversation, we want to update all the messages with isRead:true
 */
export const readChatMessages = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    // Return an error response or throw an error
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* mark messages as read in redis cache and return the last message updated */
  const updatedMessage: IMessageData = await markMessagesAsRead(senderId, receiverId);
  /* emit socket io event with the last message updated */
  socketIo.emit('message read', updatedMessage);
  socketIo.emit('chat list ', updatedMessage);
  /* mark all messaged as read in mongoDB */
  ChatQueue().addChatMessageJob('markMessageAsReadInDB', {
    senderId: new mongoose.Types.ObjectId(senderId),
    receiverId: new mongoose.Types.ObjectId(receiverId)
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Marked messages as read' });
};
