import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ISearchUser } from '../interfaces/user.interface';
import { UserService } from '@src/shared/services/db/user.service';
import { escapeRegex } from '@src/shared/globals/helpers/escape-regex';
import { BadRequestError } from '@src/middleware/error-middleware';

/**
 * search users controllers
 * user to search a specific user by matching a query with the username of the users in database
 * us use a specific RegEx expression for the query
 * ! the searched is performed only on mongoDB database, to do the search in redis cache it seems to be complicated and additional packages are needed
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  if (!req.params.query) {
    return BadRequestError('Invalid request parameters.');
  }
  const regex = new RegExp(escapeRegex(req.params.query), 'i');
  const users: ISearchUser[] = await UserService.searchUsers(regex);

  res.status(HTTP_STATUS.OK).json({ message: 'Search results', users });
};
