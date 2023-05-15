import { IQueryReaction, IReactionDocument, IReactionJob } from 'features/reaction/interfaces/reaction.interface';
import { getUserFromCache } from '../redis/user.cache';
import { ReactionModel } from 'features/reaction/models/reaction.model';
import { PostModel } from 'features/post/models/Post.model';
import mongoose from 'mongoose';
import { INotificationDocument, INotificationTemplate } from 'features/notification/interfaces/notification.interface';
import { NotificationModel } from 'features/notification/models/notification.model';
import { notificationTemplate } from '../emails/templates/notifications/notification-template';
import { emailQueue } from '../queues/email.queue';
import { getIOInstance } from 'config/socketIO';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { IPostDocument } from 'features/post/interfaces/post.interface';

export const ReactionService = {
  addReactionDataToDB: async (reactionData: IReactionJob): Promise<void> => {
    const socketIo = getIOInstance();
    const { postId, username, previousReaction, userTo, userFrom, type, reactionObject } = reactionData;

    const updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    /* if previous reaction exist do not replace the id of the reaction from mongoDB */
    if (previousReaction) {
      delete updatedReactionObject._id;
    }
    const [userInfo, reactionUpdated, postUpdated]: [IUserDocument | null, any, IPostDocument | null] = await Promise.all([
      getUserFromCache(userTo),
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

    if (userInfo?.notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom as string,
        userTo: userTo as string,
        message: `${username} reacted to your post!`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(reactionUpdated._id),
        createdAt: new Date(),
        comment: '',
        post: postUpdated?.post!,
        imgId: postUpdated?.imgId!,
        imgVersion: postUpdated?.imgVersion!,
        gifUrl: postUpdated?.gifUrl!,
        reaction: type!
      });
      /* send notification via socket io */
      socketIo.emit('insert notification', notifications, { userTo });

      const emailTemplate: INotificationTemplate = {
        username: userInfo.username!,
        message: `${username} is not following you`,
        header: 'Post reaction notification'
      };
      const template: string = notificationTemplate(emailTemplate);

      /** send an email to the user whose post received a reaction*/
      emailQueue().addEmailJob('reactionsEmail', {
        receiverEmail: userInfo.email!,
        template,
        subject: `${username} is now following you.`
      });
    }
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
