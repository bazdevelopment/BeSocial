import { IMessageData } from 'features/chat/interfaces/chat.interface';
import { IConversationDocument } from 'features/chat/interfaces/conversation.interface';
import { MessageModel } from 'features/chat/models/chat.model';
import { ConversationModel } from 'features/chat/models/conversation.model';
import { ObjectId } from 'mongodb';

export const ChatService = {
  /**
   * Add a comment in mongoDB and update commentsCount for a specific post
   */
  addMessageToDb: async (message: IMessageData): Promise<void> => {
    const conversation: IConversationDocument[] = await ConversationModel.find({ _id: message?.conversationId }).exec();
    /* if the conversationId between 2 users doesn't exist, then create it */
    if (!conversation.length)
      await ConversationModel.create({ _id: message?.conversationId, senderId: message.senderId, receiverId: message.receiverId });
    /* each time when a message is sent the message model will create a new entry with a new message*/
    await MessageModel.create({
      _id: message._id,
      conversationId: message.conversationId,
      receiverId: message.receiverId,
      receiverUsername: message.receiverUsername,
      receiverAvatarColor: message.receiverAvatarColor,
      receiverProfilePicture: message.receiverProfilePicture,
      senderUsername: message.senderUsername,
      senderId: message.senderId,
      senderAvatarColor: message.senderAvatarColor,
      senderProfilePicture: message.senderProfilePicture,
      body: message.body,
      isRead: message.isRead,
      gifUrl: message.gifUrl,
      selectedImage: message.selectedImage,
      reaction: message.reaction
    });
  },
  /**
   * get the last conversation of the user
   */
  getUserConversationList: async (userId: ObjectId): Promise<IMessageData[]> => {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt'
        }
      },
      { $sort: { createdAt: 1 } }
    ]);
    return messages;
  },
  /* mark a specific message as deleted by updating one of this properties: deleteForMe | deleteForEveryone */
  markMessageAsDeletedInDB: async (messageId: string, type: string) => {
    if (type === 'deleteForMe') await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec();
    if (type === 'deleteForEveryone')
      await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true, deleteForEveryone: true } }).exec();
  },

  /**
   * Mark all the messages between 2 users read when they are in the same conversation room
   */
  markMessagesAsRead: async (senderId: ObjectId, receiverId: ObjectId): Promise<void> => {
    const query = {
      $or: [
        { senderId, receiverId, isRead: false },
        { senderId: receiverId, receiverId: senderId, isRead: false }
      ]
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
  },
  /**
   * Update message reaction in mongoDB
   */
  updateMessageReactionInDB: async ({
    messageId,
    senderName,
    reaction,
    type
  }: {
    messageId: ObjectId;
    senderName: string;
    reaction: string;
    type: 'add' | 'remove';
  }): Promise<void> => {
    if (type === 'add') await MessageModel.updateOne({ _id: messageId }, { $set: { reaction: [{ senderName, type: reaction }] } }).exec();
    if (type === 'remove') await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName, type: reaction } } }).exec();
  },
  /**
   * Get all the messages between 2 users
   */
  getChatMessages: async (senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> => {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
    const messages: IMessageData[] = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
    return messages;
  }
};
