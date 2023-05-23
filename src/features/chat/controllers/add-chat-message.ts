import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { BadRequestError } from 'middleware/error-middleware';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from 'shared/globals/helpers/cloudinary-upload';
import { getUserFromCache } from 'shared/services/redis/user.cache';
import { IMessageData, IMessageNotification } from '../interfaces/chat.interface';
import { getIOInstance } from 'config/socketIO';
import { INotificationTemplate } from 'features/notification/interfaces/notification.interface';
import { notificationTemplate } from 'shared/services/emails/templates/notifications/notification-template';
import { emailQueue } from 'shared/services/queues/email.queue';
import HTTP_STATUS from 'http-status-codes';
import { addChatListToCache, addChatMessageToCache } from 'shared/services/redis/chat.cache';
import { ChatQueue } from 'shared/services/queues/chat.queue';

/**
 * addChatMessage
 * controller used to create a new chat message between a sender and a receiver
 * @param conversationId - each time when a persons is sending a message to another person a conversationId is created
 * @param receiverId - the id of the user who is going to receive a new message
 * @param receiverUsername - the name of the user who is going to receive a new message
 * @param receiverAvatarColor - the avatar color of the user who is going to receive a new message
 * @param receiverProfilePicture - the profile picture of the user who is going to receive a new message
 * @param body - the content of the message
 * @param gifUrl - a gif attached to a message
 * @param isRead - check if the message is read or not
 * @param selectedImage - image attached to the message

 */
export const addChatMessage = async (req: Request, res: Response): Promise<void> => {
  const { conversationId, receiverId, receiverUsername, receiverAvatarColor, receiverProfilePicture, body, gifUrl, isRead, selectedImage } =
    req.body;

  if (!req.currentUser) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Logged in user is not existing' });
    return;
  }

  let fileUrl = '';
  const messageObjectId: ObjectId = new ObjectId();
  /* if the conversation exist cast the conversation id, is not generate a new object id */
  const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
  /* get user logged in info */
  const sender: IUserDocument = (await getUserFromCache(req.currentUser?.userId)) as IUserDocument;
  /* if an images is added to the message this is going to be uploaded to cloudinary */
  if (selectedImage.length) {
    const result: UploadApiResponse = (await uploadImageToCloudinary(
      req.body.image,
      req.currentUser?.userId,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      BadRequestError('File upload: Error occurred. Try again.');
    }
    /* a new url for the image is generated  */
    fileUrl = `https://res.cloudinary.com/${process.env.CLODINARY_NAME}/image/upload/v${result.version}/${result.public_id}`;
  }

  /* this is the payload that will be saved in redis cache/mongoDB */
  const messageData: IMessageData = {
    _id: `${messageObjectId}`,
    conversationId: new mongoose.Types.ObjectId(conversationObjectId),
    receiverId,
    receiverUsername,
    receiverAvatarColor,
    receiverProfilePicture,
    senderUsername: req.currentUser.username,
    senderId: req.currentUser.userId,
    senderAvatarColor: req.currentUser?.avatarColor,
    senderProfilePicture: sender.profilePicture,
    body,
    isRead,
    gifUrl,
    selectedImage: fileUrl,
    reaction: [],
    deleteForMe: false,
    deleteForEveryone: false,
    createdAt: new Date()
  };
  /* emit an event with the message payload when the message is sent */
  emitSocketIoEventChat(messageData);
  /* if the message is not read yet send the email notification */
  if (!isRead) {
    await sendEmailNotification({ currentUser: req.currentUser, message: body, receiverName: receiverUsername, receiverId, messageData });
  }
  /* 1-add sender to chat list in cache */
  await addChatListToCache(req.currentUser?.userId, receiverId, `${conversationObjectId}`);
  /* 2-add receiver to chat list in cache */
  await addChatListToCache(receiverId, req.currentUser?.userId, `${conversationObjectId}`);
  /* 3-add message data to cache */
  await addChatMessageToCache(`${conversationObjectId}`, messageData);
  /* 4-add message to chat queue */
  ChatQueue().addChatMessageJob('addChatMessageToDB', messageData);

  res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
};
/* helper for emitting a socket io event when a new message is created */
function emitSocketIoEventChat(data: IMessageData): void {
  const socketIo = getIOInstance();
  socketIo.emit('message received', data);
  socketIo.emit('chat list', data);
}
/* helper for sending an email notification each time when a new message is created and is not read */
async function sendEmailNotification({ currentUser, message, receiverId, receiverName }: IMessageNotification): Promise<void> {
  const cachedUser: IUserDocument = (await getUserFromCache(receiverId)) as IUserDocument;
  /**check if receiver has messages notifications set to true/false */
  if (cachedUser.notifications.messages) {
    const templateEmailParams: INotificationTemplate = {
      username: receiverName,
      message,
      header: `Message notification from ${currentUser.username}`
    };
    const templateEmail = notificationTemplate(templateEmailParams);
    emailQueue().addEmailJob('directMessageEmail', {
      receiverEmail: currentUser.email,
      template: templateEmail,
      subject: `You've received messages from ${currentUser.username}`
    });
  }
}
