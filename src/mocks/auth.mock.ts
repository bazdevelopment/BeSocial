import { IAuthPayload } from 'features/auth/interfaces/auth.interface';
import { Response } from 'express';

/**
 * Generate a mock HTTP request object for testing authentication-related functions.
 * @param {Object} sessionData - Data to include in the mock session object.
 * @param {Object} body - Data to include in the mock request body object.
 * @param {Object} [currentUser] - Data to include in the mock current user object.
 * @param {Object} [params] - Data to include in the mock request parameters object.
 * @returns {Object} - A mock HTTP request object containing the provided data.
 */
export const authMockRequest = (sessionData: IJwtSession, body: IAuthMock, currentUser?: IAuthPayload, params?: IParams) => {
  return {
    session: sessionData,
    body,
    currentUser,
    params
  };
};

/**
 * Generate a mock HTTP response object for testing authentication-related functions.
 * @returns {Object} - A mock HTTP response object with status and json methods.
 */
export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IParams {
  id: number;
}
export interface IJwtSession {
  jwt?: string;
}

export interface IAuthMock {
  _id?: string;
  username?: string;
  email?: string;
  uId?: string;
  password?: string;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  quote?: string;
  work?: string;
  school?: string;
  location?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  messages?: boolean;
  reactions?: boolean;
  comments?: boolean;
  follows?: boolean;
}
