import mongoose, { Model, Schema, model } from 'mongoose';
import { IFollowerDocument } from '../interface/follower.interface';

export const followerSchema: Schema = new Schema(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    followeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
  },
  {
    timestamps: true /* Automatically create createdAt timestamp */
  }
);
const FollowerModel: Model<IFollowerDocument> = model<IFollowerDocument>('Follower', followerSchema, 'Follower');
export { FollowerModel };
