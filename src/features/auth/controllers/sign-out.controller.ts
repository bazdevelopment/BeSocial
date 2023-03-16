import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

/**
 * Sign out the user by removing token from the session
 * @route POST api/v1/auth/signout
 * @access Public
 */
export const signOut = (req: Request, res: Response): void => {
  req.session = null;
  res.status(HTTP_STATUS.OK).json({ message: 'Logout sucessfull', user: {}, token: '' });
};
