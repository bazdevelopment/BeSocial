import mongoose, { Model, Schema, model } from 'mongoose';
import { INotification, INotificationDocument } from '../interfaces/notification.interface';
import { NotificationService } from 'shared/services/db/notification.service';

export const notificationSchema: Schema = new Schema(
  {
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    createdItemId: mongoose.Schema.Types.ObjectId,
    comment: { type: String, default: '' },
    reaction: { type: String, default: '' },
    post: { type: String, default: '' },
    imgId: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    gifUrl: { type: String, default: '' }
  },
  {
    timestamps: true /* Automatically create createdAt timestamp */
  }
);
/**
 * insertNotification is a method declared directly in the notification model
 * used especially to save a notification in mongoDB database
 * ! we don't save notifications of any kind in redis cache
 */
notificationSchema.methods.insertNotification = async function (body: INotification) {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl
  } = body;
  /* insert notification in mongoDB */
  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl
  });
  try {
    /* fetch all the notifications for that user */
    const notifications: INotificationDocument[] = await NotificationService.getNotifications(userTo);
    return notifications;
  } catch (error) {
    return error;
  }
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');
export { NotificationModel };
