import { Document, ObjectId } from 'mongoose';

export interface IFileImageDocument extends Document {
  userId: ObjectId | string;
  bgImageVersion: string;
  bgImageId: string /* user background image */;
  imgId: string /* user profile picture */;
  imgVersion: string;
  createdAt: Date;
}

export interface IFileImageJobData {
  url?: string;
  imgId?: string;
  imgVersion?: string;
  userId?: string;
  imageId?: string;
}

export interface IBgUploadResponse {
  version: string;
  publicId: string;
  public_id?: string;
}
