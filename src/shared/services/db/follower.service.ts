import { FollowerModel } from 'features/follower/models/follower.model';
import { UserModel } from 'features/user/models/user.model';
import mongoose from 'mongoose';
import { ObjectId, BulkWriteResult } from 'mongodb';
import { IFollowerData } from 'features/follower/interface/follower.interface';

export const FollowService = {
  addFollowerToDB: async ({
    userId,
    followeeId,
    // username,
    followerDocumentId
  }: {
    userId: string;
    followeeId: string;
    username: string;
    followerDocumentId: ObjectId;
  }): Promise<void> => {
    /* cast properties to ObjectId */
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    /* add the new follower in mongoDB */
    await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    /* update followingCount and followersCount properties for each user*/
    const updateUsers: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    await Promise.all([updateUsers]);
  },
  removeFollowerFromDB: async (followeeId: string, followerId: string): Promise<void> => {
    /* cast properties to ObjectId */
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);
    /* remove the follower from mongoDB */
    const unfollow = await FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    /* update followingCount and followersCount properties for each user*/
    const updateUsers: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);
    await Promise.all([unfollow, updateUsers]);
  },
  /**
   *  getUserFollower- retrieves data about the followers of a given user
   */
  getUserFollowers: async (userId: string | ObjectId): Promise<IFollowerData[]> => {
    const allUserFollowers: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: userId } } /* return all the documents that matches followerId=userId */,
      {
        $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followingUser' }
      } /* Lookup in the User collection matching the followeeId and _id form Follower collection,  The result of this join is stored in the field followee as an array. */,
      { $unwind: '$followingUser' } /* deconstruct and generates a separate document for each element in the array */,
      {
        $lookup: { from: 'Auth', localField: 'followingUser.authId', foreignField: '_id', as: 'authId' }
      } /* Lookup in the Auth collection matching the follower authId(inherited from the User collection) and _id. The result is stored in the authId field as an array. follower.authId ~ [user].authId*/,
      { $unwind: '$authId' } /* deconstruct and generates a separate document for each element in the array */,
      {
        /* It extracts specific fields from the followeeId and authId objects and assigns them to new fields in the documents. For example, the _id field of each followeeId document is assigned to the _id field in the pipeline document,
          the username field of each authId document is assigned to the username field in the pipeline document, and so on. */
        $addFields: {
          avatarColor: '$authId.avatarColor',
          followersCount: '$followingUser.followingUserCount',
          followingCount: '$followingUser.followingCount',
          profilePicture: '$followingUser.profilePicture',
          postCount: '$followingUser.postsCount',
          username: '$authId.username',
          _id: '$followingUser._id',
          userProfile: '$followingUser'
        }
      },
      {
        /* project is used for excluding.including fields, in this case it excludes the authId, followerId, followeeId, createdAt, and __v fields from the final output. */
        $project: {
          authId: 0,
          followingUser: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0
        }
      }
    ]);
    return allUserFollowers;
  },
  /**
   *   getFollowingUsers- retrieves data about the the users that a specific user is following
   */
  getFollowingUsers: async (userId: string | ObjectId): Promise<IFollowerData[]> => {
    const allUserFollowers: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: userId } } /* return all the documents that matches followerId=userId */,
      {
        $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'follower' }
      } /* Lookup in the User collection matching the followeeId form Follower collection with _id from the User collection,  The result of this join is stored in the field followee as an array. */,
      { $unwind: '$follower' } /* deconstruct and generates a separate document for each element in the array */,
      {
        $lookup: { from: 'Auth', localField: 'follower.authId', foreignField: '_id', as: 'authId' }
      } /* Lookup in the Auth collection matching the follower authId(inherited from the User collection) and _id. The result is stored in the authId field as an array. follower.authId ~ [user].authId*/,
      { $unwind: '$authId' } /* deconstruct and generates a separate document for each element in the array */,
      {
        /* It extracts specific fields from the followeeId and authId objects and assigns them to new fields in the documents. For example, the _id field of each followeeId document is assigned to the _id field in the pipeline document,
        the username field of each authId document is assigned to the username field in the pipeline document, and so on. */
        $addFields: {
          avatarColor: '$authId.avatarColor',
          followersCount: '$follower.followerCount',
          followingCount: '$follower.followingCount',
          profilePicture: '$follower.profilePicture',
          postCount: '$follower.postsCount',
          username: '$authId.username',
          _id: '$follower._id',
          userProfile: '$follower'
        }
      },
      {
        /* project is used for excluding.including fields, in this case it excludes the authId, followerId, followeeId, createdAt, and __v fields from the final output. */
        $project: {
          authId: 0,
          follower: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0
        }
      }
    ]);
    return allUserFollowers;
  }
};
