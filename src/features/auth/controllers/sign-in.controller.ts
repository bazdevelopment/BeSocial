import { Request, Response } from 'express';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { BadRequestError } from 'middleware/error-middleware';
import { AuthService } from 'shared/services/db/auth.service';
import { UserService } from 'shared/services/db/user.service';
import { IAuthDocument } from '../interfaces/auth.interface';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';

/**
 * Login with email and password
 * @route POST api/v1/auth/signin
 * @access Public
 */
const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const existingUser: IAuthDocument = await AuthService.getUserByEmail(email);

  if (!existingUser) {
    return BadRequestError('Invalid credentials');
  }

  const passwordMatch = await existingUser.comparePassword(password);
  if (!passwordMatch) {
    return BadRequestError('Invalid password');
  }

  const user: IUserDocument = await UserService.getUserByUserId(existingUser.userId);

  const userJwt: string = JWT.sign(
    {
      _id: existingUser.userId,
      userId: existingUser.userId,
      email: existingUser.email,
      username: existingUser.username,
      avatarColor: existingUser.avatarColor
    },
    process.env.JWT_TOKEN!
  );

  req.session = { jwt: userJwt };
  res.status(HTTP_STATUS.OK).json({
    message: 'User login successfully',
    user: { email: existingUser.email, username: existingUser.username, ...user },
    token: userJwt
  });
};
export { signIn };
