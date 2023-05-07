import mongoose, { Schema, model, Model } from 'mongoose';
import { IReactionDocument } from '../interfaces/reaction.interface';

const reactionSchema: Schema = new Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
    type: { type: String, default: '' },
    username: { type: String, default: '' },
    avatarColor: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
  },
  {
    timestamps: true /* Automatically create createdAt timestamp */
  }
);

const ReactionModel: Model<IReactionDocument> = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');
export { ReactionModel };
