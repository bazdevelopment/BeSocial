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

const errorHandler = (err: Error, _req: Request, res: Response): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === ENVIRONMENTS.production ? null : err.stack
  });
};

const BadRequestError = (message: string | undefined) => {
  const error: CustomError = new Error(message);
  error.statusCode = HTTP_STATUS.BAD_REQUEST;
  throw error;
};

const NotAuthorizedError = (message: string | undefined) => {
  const error: CustomError = new Error(message);
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  throw error;
};

export { notFound, errorHandler, BadRequestError, NotAuthorizedError };
