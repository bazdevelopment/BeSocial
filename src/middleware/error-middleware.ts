import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ENVIRONMENTS } from 'constants/environment';
import { CustomError } from 'types/custom-error.interface';

/** Middleware for handling edge cases. E.g. When the server is called with  the wrong route */
const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: Error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * This function is used to catch any errors thrown from other handlers or middleware
 * returns the appropriate status code and error message. Based on if the environment is in production or not, it will send a stack trace along with the message.
 **/
const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === ENVIRONMENTS.production ? null : err.stack
  });
  next();
};

/**
 * Helper method for displaying an error message
 *  Status code :BAD_REQUEST = 400
 */
const BadRequestError = (message: string | undefined) => {
  const error: CustomError = new Error(message);
  error.statusCode = HTTP_STATUS.BAD_REQUEST;
  throw error;
};

/**
 * Helper method for displaying an error message
 *  Status code :INTERNAL_SERVER_ERROR = 400
 */
export const ServerError = (message: string | undefined) => {
  const error: CustomError = new Error(message);
  error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  throw error;
};

/**
 * Helper method for displaying an error message
 *  Status code : UNAUTHORIZED = 401
 */
const NotAuthorizedError = (message: string | undefined) => {
  const error: CustomError = new Error(message);
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  throw error;
};

export { notFound, errorHandler, BadRequestError, NotAuthorizedError };
