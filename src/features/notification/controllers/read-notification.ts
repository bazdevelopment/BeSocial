import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { getIOInstance } from 'config/socketIO';
import { NotificationQueue } from 'shared/services/queues/notification.queue';
/**
* readNotification
 * This controller function is responsible for reading a notification.

 */
export const readNotification = (req: Request, res: Response) => {
  const socketIo = getIOInstance();
  const { notificationId } = req.params;
  if (!notificationId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  /* Emit a Socket.IO event to read the notification */
  socketIo.emit('read notification', notificationId);
  /* Add a notification job to the NotificationQueue */
  NotificationQueue().addNotificationJob('readNotification', { notificationId });

  res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
};
