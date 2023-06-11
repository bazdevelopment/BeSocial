import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IMessageData } from '../interfaces/chat.interface';
import { markMessageAsDeletedInCache } from '@src/shared/services/redis/chat.cache';
import mongoose from 'mongoose';
import { getIOInstance } from '@src/config/socketIO';
import { ChatQueue } from '@src/shared/services/queues/chat.queue';

/**
 * deleteChatMessage
 * controller used to delete mark as deleted specific chat message between 2 persons
 * !the message is not completely deleted, only these 2 fields are updated
 * @param senderId - id of the user who send a message
 * @param receiverId - id of the user who is going to receive a message
 * @param messageId - the id of the message
 * @param type - used to update one of these fields "deleteForMe" | "deleteForEveryone"
 */
export const deleteChatMessage = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();

  const { senderId, receiverId, messageId, type } = req.params;

  if (!senderId || !receiverId || !messageId || !type) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* update "deleteForMe" | "deleteForEveryone" fields for a specific message in redis cache */
  const updatedMessage: IMessageData = await markMessageAsDeletedInCache({ senderId, receiverId, messageId, type });
  /* emit the socket io event when the message was marked as deleted */
  socketIo.emit('message deleted', updatedMessage);
  socketIo.emit('chat list ', updatedMessage);
  /* update "deleteForMe" | "deleteForEveryone" fields for a specific message in mongoDB */
  ChatQueue().addChatMessageJob('markMessageAsDeletedInDB', {
    messageId: new mongoose.Types.ObjectId(messageId),
    type
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Message marked as deleted' });
};
