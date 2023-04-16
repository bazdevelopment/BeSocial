import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { BadRequestError } from './error-middleware';

/**
 * Middleware used for validate the endpoint params
 * if the validation conditions are not compliant, an error will be returned
 */
export function joiValidation(schema: ObjectSchema): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { error } = await Promise.resolve(schema.validate(req.body));
    if (error?.details) {
      BadRequestError(error?.details[0]?.message);
    }
    next();
  };
}
