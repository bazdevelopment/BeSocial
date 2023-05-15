import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { getIOInstance } from 'config/socketIO';
import { NotificationQueue } from 'shared/services/queues/notification.queue';
/**
 * deleteNotification
 * This controller function is responsible for deleting a notification.
 */
export const deleteNotification = async (req: Request, res: Response) => {
  const socketIo = getIOInstance();
  const { notificationId } = req.params;
  if (!notificationId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /*  Emit a Socket.IO event to delete the notification */
  socketIo.emit('delete notification', notificationId);
  /*  Add a notification job to the NotificationQueue */
  NotificationQueue().addNotificationJob('deleteNotification', { notificationId });

  res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted' });
};
