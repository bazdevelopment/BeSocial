import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface INotificationDocument extends Document {
  _id?: mongoose.Types.ObjectId | string;
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: mongoose.Types.ObjectId;
  createdItemId: mongoose.Types.ObjectId;
  comment: string;
  reaction: string;
  post: string | ObjectId;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
  read?: boolean;
  createdAt?: Date;
  insertNotification(data: INotification): Promise<void>;
}

export interface INotification {
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: ObjectId;
  createdItemId: ObjectId;
  createdAt: Date;
  comment: string;
  reaction: string;
  post: string | ObjectId;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
}

export interface INotificationJobData {
  notificationId: string;
}

export interface INotificationTemplate {
  username: string;
  message: string;
  header: string;
}
