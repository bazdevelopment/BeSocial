import { IAuthPayload } from '@src/features/auth/interfaces/auth.interface';
import { IReaction } from '@src/features/reaction/interfaces/reaction.interface';
import mongoose, { Document } from 'mongoose';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderUsername: string;
  senderAvatarColor: string;
  senderProfilePicture: string;
  receiverUsername: string;
  receiverAvatarColor: string;
  receiverProfilePicture: string;
  body: string;
  gifUrl: string;
  isRead: boolean;
  selectedImage: string;
  reaction: IReaction;
  createdAt: Date;
  deleteForMe: boolean;
  deleteForEveryone: boolean;
}

export interface IMessageData {
  _id: string | mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  receiverId: string;
  receiverUsername: string;
  receiverAvatarColor: string;
  receiverProfilePicture: string;
  senderUsername: string;
  senderId: string;
  senderAvatarColor: string;
  senderProfilePicture: string;
  body: string;
  isRead: boolean;
  gifUrl: string;
  selectedImage: string;
  reaction: IReaction[];
  deleteForMe: boolean;
  deleteForEveryone: boolean;
  createdAt: Date;
}

export interface IMessageNotification {
  currentUser: IAuthPayload;
  message: string;
  receiverName: string;
  receiverId: string;
  messageData: IMessageData;
}

export interface IChatUsers {
  userOne: string;
  userTwo: string;
}

export interface IChatList {
  receiverId: string;
  conversationId: string;
}

export interface IChatJobData {
  senderId?: mongoose.Types.ObjectId | string;
  receiverId?: mongoose.Types.ObjectId | string;
  messageId?: mongoose.Types.ObjectId | string;
  senderName?: string;
  reaction?: string;
  type?: string;
}

export interface iSenderReceiver {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
}

export interface IGetMessageFromCache {
  messageIndex: number;
  message: string;
  receiver: IChatList;
}
