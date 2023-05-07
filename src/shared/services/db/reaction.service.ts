import { IQueryReaction, IReactionDocument, IReactionJob } from 'features/reaction/interfaces/reaction.interface';
import { getUserFromCache } from '../redis/user.cache';
import { ReactionModel } from 'features/reaction/models/reaction.model';
import { PostModel } from 'features/post/models/Post.model';
import mongoose from 'mongoose';

export const ReactionService = {
  addReactionDataToDB: async (reactionData: IReactionJob): Promise<void> => {
    const { postId, username, previousReaction, userTo, type, reactionObject } = reactionData;
    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    /* if previous reaction exist do not replace the id of the reaction from mongoDB */
    if (previousReaction) {
      delete updatedReactionObject._id;
    }
    // const updatedReaction =
    await Promise.all([
      getUserFromCache(`${userTo}`),
      /* Replace reaction document in DB if exists, if not, based on upsert:true, create a new document */
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
      /* Find the post and decrement previous reaction and increment the new one */
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ]);
    /**Send reaction notification */
  },

  removeReactionDataFromDB: async (reactionData: IReactionJob): Promise<void> => {
    const { postId, previousReaction, username } = reactionData;
    /* Delete reaction document from mongoDB */
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      /* Decrement the number of previous reaction from the post */
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  },
  /**
   * Get all reactions for a specific post from mongoDB
   */
  getPostReactions: async (
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<{ reactions: IReactionDocument[]; numberOfReactions: number }> => {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);

    return { reactions: reactions || [], numberOfReactions: reactions.length };
  },
  /**
   * Get the reaction the a specific user added to a specific post from mongoDB
   */
  getSinglePostReactionByUsername: async (
    postId: string,
    username: string
  ): Promise<{ reactions: IReactionDocument[]; numberOfReactions: number }> => {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username } }
    ]);

    return { reactions: reactions || [], numberOfReactions: reactions.length };
  },
  /**
   * Get all the reactions for a specific user
   */
  getReactionsByUsername: async (username: string): Promise<IReactionDocument[]> => {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: { username } }]);
    return reactions;
  }
};
