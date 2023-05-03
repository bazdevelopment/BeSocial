import { ObjectId } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  avatarColor: string;
  type: string;
  postId: string;
  profilePicture: string;
  createdAt?: Date;
  userTo?: string | ObjectId;
  comment?: string;
}

export interface IReactions {
  like: number;
  love: number;
  happy: number;
  wow: number;
  sad: number;
  angry: number;
}
