import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { AuthModel } from '../models/auth.model';
import { BadRequestError } from 'middleware/error-middleware';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { uploadFileToCloudinary } from 'shared/globals/helpers/cloudinary-upload';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { saveUserToCache } from 'shared/services/redis/user.cache';
import { authQueue } from 'shared/services/queues/auth.queue';
import { userQueue } from 'shared/services/queues/user.queue';
import JWT from 'jsonwebtoken';

/**
 * Register a new user
 * @route POST api/v1/auth/signup
 * @access Public
 */
const signUp = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, avatarColor, avatarImage } = req.body;

  const userExist = await AuthModel.findOne({ email });
  if (userExist) {
    BadRequestError('User already exists 😢');
  }

  const userObjectId: ObjectId = new ObjectId();

  const authData: IAuthDocument = signupData({ _id: userObjectId, userId: userObjectId, username, email, password, avatarColor });

  /* Upload avatar image to cloudinary after the account has been created successfully*/
  const result: UploadApiResponse = (await uploadFileToCloudinary(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
  if (!result?.public_id) {
    BadRequestError('File upload: Error occurred. Try again.');
  }

  /* Add the new created user to redis cache */
  const userDataForRedisCache: IUserDocument = createUserProfile(authData);
  userDataForRedisCache.profilePicture = `https://res.cloudinary.com/${process.env.CLODINARY_NAME}/image/upload/v${result.version}/${userObjectId}`;
  await saveUserToCache(userDataForRedisCache);

  /* Add to database */
  authQueue().addAuthUserJob('addAuthUserToDB', { value: authData });
  userQueue().addUserJob('addUserToDB', { value: userDataForRedisCache });
  /* Add token to session */
  const userJWT: string = generateSignToken(authData);
  req.session = { jwt: userJWT };

  res.status(HTTP_STATUS.CREATED).json({
    message: 'User created successfully',
    user: authData
  });
};

/**
 * Function that encrypts the authentication data into a jwt token
 * @param authData
 */
const generateSignToken = (authData: IAuthDocument): string => {
  return JWT.sign(
    {
      _id: authData.userId,
      userId: authData.userId,
      username: authData.username,
      email: authData.email,
      avatarColor: authData.avatarColor
    },
    process.env.JWT_TOKEN!
  );
};

/**
 * signupData
 * Helper method to used to create the authentication object for the users
 */
const signupData = (data: ISignUpData): IAuthDocument => {
  const { _id, username, email, userId, password, avatarColor } = data;

  return {
    _id,
    userId,
    username,
    email,
    password,
    avatarColor,
    createdAt: new Date()
  } as unknown as IAuthDocument;
};

/**
 * signupData
 * Helper method to used to create the user profile based on authentication details
 */
export const createUserProfile = (userInfo: IAuthDocument): IUserDocument =>
  ({
    _id: userInfo.userId,
    authId: userInfo.userId,
    username: userInfo.username,
    email: userInfo.email,
    password: userInfo.password,
    avatarColor: userInfo.avatarColor,
    userId: userInfo.userId,
    postsCount: 0,
    work: '',
    school: '',
    quote: '',
    location: '',
    blocked: [],
    blockedBy: [],
    followersCount: 0,
    followingCount: 0,
    notifications: {
      messages: true,
      reactions: true,
      comments: true,
      follows: true
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    },
    bgImageVersion: '',
    bgImageId: '',
    profilePicture: ''
  } as unknown as IUserDocument);

export { signUp };
