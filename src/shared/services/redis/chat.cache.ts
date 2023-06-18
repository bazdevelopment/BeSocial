import { ServerError } from '@src/middleware/error-middleware';
import { getRedisClient } from './redis.connection';
import { IChatList, IGetMessageFromCache, IMessageData } from '@src/features/chat/interfaces/chat.interface';
import { IReaction } from '@src/features/reaction/interfaces/reaction.interface';
/**
 * addChatListToCache
 * !scenario : when a used send a message to another user the "chatList" section is being populated with the sender id and receiverId
 */
export const addChatListToCache = async (senderId: string, receiverId: string, conversationId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* get all existing items from chatList that are assigned to the senderId */
    const userChatList = await client.LRANGE(`chatList:${senderId}`, 0, -1);
    /* if chatList doesn't exist in redis cache or chatList exist but received is not included populate the chatList */
    if (userChatList.length === 0 || !userChatList.some((item) => item.includes(receiverId))) {
      await client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
    }
  } catch (error) {
    console.log('[chat.cache-addChatListToCache] : Server error');
    ServerError('[chat.cache-addChatListToCache] : Server error');
  }
};

/**
 * addChatMessageToCache
 * used to push a new message in the "messages" section based on a conversationId in redis cache
 */
export const addChatMessageToCache = async (conversationId: string, message: IMessageData): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* push the new message is redis cache using conversationId */
    await client.RPUSH(`messages:${conversationId}`, JSON.stringify(message));
  } catch (error) {
    console.log('[chat.cache-addChatMessageToCache] : Server error');
    ServerError('[chat.cache-addChatMessageToCache] : Server error');
  }
};

/**
 * getUserConversationList
 * used to get the last conversation of the user
 */
export const getUserConversationListFromCache = async (userId: string): Promise<IMessageData[]> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* get userChatList based on userId */
    const userChatList: string[] = await client.LRANGE(`chatList:${userId}`, 0, -1);
    const conversationChatList: IMessageData[] = [];
    /* For each conversation from userChatList get only the last message from redis cache */
    for (const conversation of userChatList) {
      const chatConversation: IChatList = JSON.parse(conversation);
      /* getting the last message from messages entry from redis cache */
      const lastMessage: string = (await client.LINDEX(`messages:${chatConversation.conversationId}`, -1)) as string;
      conversationChatList.push(JSON.parse(lastMessage));
    }
    return conversationChatList;
  } catch (error) {
    console.log('[chat.cache-getUserConversationListFromCache] : Server error');
    return ServerError('[chat.cache-getUserConversationListFromCache] : Server error');
  }
};

/**
 * getChatMessagesFromCache
 * get all the messages between 2 users from redis cache
 */
export const getChatMessagesFromCache = async (senderId: string, receiverId: string) => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const userChatList: string[] = await client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiver: string = userChatList.find((chatConversation) => chatConversation.includes(receiverId)) as string;
    const parsedReceiver: IChatList = JSON.parse(receiver);
    if (parsedReceiver) {
      const userMessages: string[] = await client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
      const chatMessages: IMessageData[] = [];
      for (const message of userMessages) {
        chatMessages.push(JSON.parse(message));
      }
      return chatMessages;
    }
    /* if there are no messages return [] */
    return [];
  } catch (error) {
    console.log('[chat.cache-getUserConversationList] : Server error');
    return ServerError('[chat.cache-getUserConversationList] : Server error');
  }
};

/**
 * markMessageAsDeleted
 * Helpers used to update the deleteForMe/deleteForEveryone properties in redis cache
 */
export const markMessageAsDeletedInCache = async ({
  senderId,
  receiverId,
  messageId,
  type
}: {
  senderId: string;
  receiverId: string;
  messageId: string;
  type: string;
}): Promise<IMessageData> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    /* find the message */
    const { messageIndex, message, receiver } = await getMessage(senderId, receiverId, messageId);
    const chatMessage = JSON.parse(message);
    /**
     * TODO: consider creating an enum for type
     */
    if (type === 'deleteForMe') {
      chatMessage.deleteForMe = true;
    }
    if (type === 'deleteForEveryone') {
      chatMessage.deleteForMe = true;
      chatMessage.deleteForEveryone = true;
    }
    /* save new updated message */
    await client.LSET(`messages:${receiver.conversationId}`, messageIndex, JSON.stringify(chatMessage));
    /* get the message updated (you can easily use chatMessage above, but I wanted to see how to use LINDEX) */
    const lastMessage: string = (await client.LINDEX(`messages:${receiver.conversationId}`, messageIndex)) as string;
    /* return the updated message */
    return JSON.parse(lastMessage) as IMessageData;
  } catch (error) {
    console.log('[chat.cache-markMessageAsDeletedInCache] : Server error');
    return ServerError('[chat.cache-markMessageAsDeletedInCache] : Server error');
  }
};

/**
 * markMessagesAsRead
 * when 2 users are one the same chat page, all the messaged between them should be read
 * in this case we have to change the isRead property to true for each message from redis cache
 */
export const markMessagesAsRead = async (senderId: string, receiverId: string): Promise<IMessageData> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const userChatList: string[] = await client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiver = userChatList.find((conversation) => conversation.includes(receiverId)) as string;
    const parsedReceiver: IChatList = JSON.parse(receiver) as IChatList;
    const messages: string[] = await client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
    /* get all messages where isRead=false */
    const unreadMessages: string[] = messages.filter((message) => !JSON.parse(message).isRead);

    for (const [index, message] of unreadMessages.entries()) {
      const chatMessage: IMessageData = JSON.parse(message) as IMessageData;
      chatMessage.isRead = true;
      await client.LSET(`messages:${parsedReceiver.conversationId}`, index, JSON.stringify(chatMessage));
    }
    /* return the last updated  message after changing isRead:true to all the messages */
    const lastMessage: string = (await client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1)) as string;
    return JSON.parse(lastMessage);
  } catch (error) {
    console.log('[chat.cache-markMessagesAsRead] : Server error');
    return ServerError('[chat.cache-markMessagesAsRead] : Server error');
  }
};
/**
 * addMessageReaction
 * helper used to add a reaction for a specific message
 * the user can add only one reaction for a message, and if the wants to change the reaction, the previous one will be deleted
 */
export const addMessageReactionInCache = async ({
  conversationId,
  messageId,
  reaction,
  senderName,
  type
}: {
  conversationId: string;
  messageId: string;
  reaction: string;
  senderName: string;
  type: 'add' | 'remove';
}): Promise<IMessageData> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) await client.connect();
    const messages: string[] = await client.LRANGE(`messages:${conversationId}`, 0, -1);
    const messageIndex: number = messages.findIndex((message) => message.includes(messageId));
    const message: string = (await client.LINDEX(`messages:${conversationId}`, messageIndex)) as string;
    const parsedMessage: IMessageData = JSON.parse(message);
    const reactions: IReaction[] = [];
    if (parsedMessage) {
      const existingUserReaction = parsedMessage.reaction.find((reaction) => reaction.senderName === senderName);
      if (existingUserReaction) {
        parsedMessage.reaction = [];
      }
      if (type === 'add') {
        reactions.push({ senderName, type: reaction });
        parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
        await client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
      }
      if (type === 'remove') {
        await client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(parsedMessage));
      }
    }
    const updatedMessage: string = (await client.LINDEX(`messages:${conversationId}`, messageIndex)) as string;
    return JSON.parse(updatedMessage);
  } catch (error) {
    console.log('[chat.cache-addMessageReaction] : Server error');
    return ServerError('[chat.cache-addMessageReaction] : Server error');
  }
};
/**
 * Helper function for getting a specific message between 2 persons using messageId
 */
async function getMessage(senderId: string, receiverId: string, messageId: string): Promise<IGetMessageFromCache> {
  const client = getRedisClient();
  if (!client.isOpen) await client.connect();

  const userChatList: string[] = await client.LRANGE(`chatList:${senderId}`, 0, -1);
  const receiver: string = userChatList.find((conversation) => conversation.includes(receiverId)) as string;
  /** TODO : consider renaming parsedReceiver with something else */
  const parsedReceiver: IChatList = JSON.parse(receiver);
  const messages: string[] = await client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
  const message: string = messages.find((message) => message.includes(messageId)) as string;
  const messageIndex: number = messages.findIndex((message) => message.includes(messageId));
  return { messageIndex, message, receiver: parsedReceiver };
}
