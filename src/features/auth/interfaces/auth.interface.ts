import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@src/features/user/interfaces/user.interface';

/* req.currentUser will be visible in the req object */
declare global {
  namespace Express {
    interface Request {
      currentUser?: IAuthPayload;
    }
  }
}

export interface IAuthPayload {
  userId: string;
  email: string;
  username: string;
  avatarColor: string;
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  userId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  avatarImage: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  userId: string | ObjectId;
  email: string;
  username: string;
  password: string;
  avatarColor: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
