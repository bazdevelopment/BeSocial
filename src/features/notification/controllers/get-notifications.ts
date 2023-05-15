import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { INotificationDocument } from '../interfaces/notification.interface';
import { NotificationService } from 'shared/services/db/notification.service';

/**
 * getNotifications
 * This controller function is responsible for fetching all the notifications for the logged in user
 */
export const getNotifications = async (req: Request, res: Response) => {
  if (!req.currentUser?.userId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request parameters.' });
    return;
  }
  const notifications: INotificationDocument[] = await NotificationService.getNotifications(req.currentUser?.userId);
  res.status(HTTP_STATUS.OK).json({ message: 'user notifications', notifications });
};
