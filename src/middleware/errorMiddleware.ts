import { NextFunction, Request, Response } from 'express';
import { ENVIRONMENTS } from 'constants/environment';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: Error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === ENVIRONMENTS.production ? null : err.stack
  });
};

export { notFound, errorHandler };
