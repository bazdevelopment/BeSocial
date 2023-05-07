import { getUserFromCache } from '../redis/user.cache';
import { PostModel } from 'features/post/models/Post.model';
import { Query } from 'mongoose';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from 'features/comment/interfaces/comment.interface';
import { CommentsModel } from 'features/comment/models/comment.model';
import { IPostDocument } from 'features/post/interfaces/post.interface';
import { IUserDocument } from 'features/user/interfaces/user.interface';

export const CommentService = {
  /**
   * Add a comment in mongoDB and update commentsCount for a specific post
   */
  addCommentToDB: async (commentData: ICommentJob): Promise<void> => {
    const { postId, userTo, comment } = commentData;
    // const {userFrom, username}=commentData

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
    await Promise.all([commentCreated, postUpdated, user]);

    /**Send comment  notification */
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
