import { ObjectId } from 'mongoose';

export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  userTo?: string | ObjectId;
}
