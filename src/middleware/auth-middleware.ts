import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from './error-middleware';
import JWT from 'jsonwebtoken';
import { IAuthPayload } from 'features/auth/interfaces/auth.interface';

/**
 * Function that checks if the user has a token assigned to his login session
 * if no token is assigned, or if the token expired an error message will be returned
 */
const verifyUser = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.session?.jwt) {
    return NotAuthorizedError('Token is not available. Please login again.');
  }

  try {
    const decodedUser: IAuthPayload = JWT.verify(req.session!.jwt, process.env.JWT_TOKEN!) as IAuthPayload;
    req.currentUser = decodedUser;
  } catch (error) {
    return NotAuthorizedError('Token is invalid. Please login again.');
  }
  next();
};

/**
 * Function that checks if the user is logged in based on the session
 */
const checkAuthentication = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.currentUser) {
    return NotAuthorizedError('Authentication is quired to access this route');
  }
  next();
};

export { verifyUser, checkAuthentication };
