import { getUserFromCache } from '../redis/user.cache';
import { PostModel } from 'features/post/models/Post.model';
import mongoose, { Query } from 'mongoose';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from 'features/comment/interfaces/comment.interface';
import { CommentsModel } from 'features/comment/models/comment.model';
import { IPostDocument } from 'features/post/interfaces/post.interface';
import { IUserDocument } from 'features/user/interfaces/user.interface';
import { INotificationDocument } from 'features/notification/interfaces/notification.interface';
import { NotificationModel } from 'features/notification/models/notification.model';
import { getIOInstance } from 'config/socketIO';

export const CommentService = {
  /**
   * Add a comment in mongoDB and update commentsCount for a specific post
   */
  addCommentToDB: async (commentData: ICommentJob): Promise<void> => {
    const { postId, userTo, comment, userFrom, username } = commentData;
    const socketIo = getIOInstance();

    /* add the comment in mongoDB */
    const commentCreated: Promise<ICommentDocument> = CommentsModel.create(comment);
    /* add update the comments count for a post*/
    const postUpdated: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      {
        _id: postId
      },
      {
        $inc: { commentsCount: 1 }
      },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;

    const user: Promise<IUserDocument> = getUserFromCache(userTo) as Promise<IUserDocument>;
    const [commentResponse, postUpdatedResponse, userUpdatedResponse] = await Promise.all([commentCreated, postUpdated, user]);

    /**Send comment  notification  */
    /* 1. Check if the comments notifications are enabled for a specific user*/
    if (userUpdatedResponse.notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userTo,
        userFrom,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(commentResponse._id?.toString()),
        comment: commentResponse.comment,
        reaction: '',
        post: postUpdatedResponse._id as string,
        imgId: postUpdatedResponse.imgId as string,
        imgVersion: postUpdatedResponse.imgVersion as string,
        gifUrl: postUpdatedResponse.gifUrl as string,
        createdAt: new Date()
      });

      /*2. send to client all the notifications via socketIo */
      socketIo.emit('insert notification', notifications, { userTo });

      /*TODO: send an email*/
    }
  },
  /**
   * Get all the comments for a specific post based on a query
   */
  getPostCommentsFromDB: async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> => {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  },
  /**
   * Get all the user names that add a comment to a post and also count
   */
  getPostCommentsUserNamesFromDB: async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> => {
    const userNameCommentList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } } /* add names and count fields in the document */,
      { $project: { _id: 0 } } /* exclude _id field which is by default set, so the response contains only names and count */
    ]);
    return userNameCommentList;
  }
};
