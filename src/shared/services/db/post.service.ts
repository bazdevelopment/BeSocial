import { IGetPostsQuery, IPostDocument } from 'features/post/interfaces/post.interface';
import { PostModel } from 'features/post/models/Post.model';
import { UserModel } from 'features/user/models/user.model';

export const PostService = {
  addPostToDb: async (userId: string, createdPost: IPostDocument): Promise<void> => {
    /**create a new post */
    const newPost = PostModel.create(createdPost);
    /** increment number of posts on the userModel*/
    const updateUserPostsCount = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([newPost, updateUserPostsCount]);
  },
  /** get all the posts from MongoDB*/
  getPostsFromDB: async (query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> => {
    let postQuery = {};
    if (query.imgId && query.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else if (query.videoId) {
      postQuery = { $or: [{ videoId: { $ne: '' } }] };
    } else {
      postQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  },
  /* get the length of posts from MongoDB */
  getPostsCount: async (): Promise<number> => {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  },
  /* Delete a post from MongoDB and decrease the total length of posts from the user details */
  deletePost: async (postId: string, userId: string): Promise<void> => {
    const deletePost = PostModel.deleteOne({ _id: postId });
    const decrementUserPostsCount = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementUserPostsCount]);
  },
  /* Update a post in MongoDB */
  updatePost: async (postId: string, updatedPost: IPostDocument): Promise<void> => {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }
};
