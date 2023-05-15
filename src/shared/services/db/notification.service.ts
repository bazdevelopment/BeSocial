import mongoose from 'mongoose';

import { INotificationDocument } from 'features/notification/interfaces/notification.interface';
import { NotificationModel } from 'features/notification/models/notification.model';

export const NotificationService = {
  /* get all the notifications for a specific user */
  getNotifications: async (userId: string): Promise<INotificationDocument[]> => {
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      { $unwind: '$userFrom' },
      { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$authId.username',
            avatarColor: '$authId.avatarColor',
            userId: '$authId.userId'
          }
        }
      }
    ]);
    return notifications;
  },
  /* change the read flag to true for each notification only in DB, because notifications are not stored in redis */
  readNotification: async (notificationId: string) => {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } }).exec();
  },
  /* delete a notification based on notificationId */
  deleteNotification: async (notificationId: string) => {
    await NotificationModel.deleteOne({ _id: notificationId }).exec();
  }
};
