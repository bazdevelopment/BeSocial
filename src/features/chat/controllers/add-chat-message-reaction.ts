import { Request, Response } from 'express';

import HTTP_STATUS from 'http-status-codes';
import { IMessageData } from '../interfaces/chat.interface';
import { addMessageReactionInCache } from 'shared/services/redis/chat.cache';
import mongoose from 'mongoose';
import { getIOInstance } from 'config/socketIO';
import { ChatQueue } from 'shared/services/queues/chat.queue';

/**
 *  addChatMessageReaction
 * controller used to add a reaction for a specific message
 *  conversationId,
 *  messageId,
 *  reaction,
 * type

 * @param conversationId - conversation id between 2 persons
 * @param  messageId - the message for which the reaction is added
 * @param  reaction - IReactions
 * @param  type- 2 actions are being performed -> add | remove
 * @returns
 */
export const addChatMessageReaction = async (req: Request, res: Response): Promise<void> => {
  const socketIo = getIOInstance();

  const { conversationId, messageId, reaction, type } = req.body;

  if (!conversationId || !messageId || !reaction || !type) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* update the redis cache message with new reaction */
  const updatedMessage: IMessageData = await addMessageReactionInCache({
    conversationId,
    messageId,
    reaction,
    senderName: req.currentUser?.username!,
    type
  });
  /* emit the message reaction event */
  socketIo.emit('message reaction', updatedMessage);
  /* update the message reaction in mongoDB */
  ChatQueue().addChatMessageJob('updateMessageReactionInDB', {
    messageId: new mongoose.Types.ObjectId(messageId),
    type,
    senderName: req.currentUser?.username,
    reaction
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added!' });
};
