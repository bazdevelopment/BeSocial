import { AuthModel } from 'features/auth/models/auth.model';
import { IBasicInfo, INotificationSettings, ISearchUser, ISocialLinks, IUserDocument } from 'features/user/interfaces/user.interface';
import { UserModel } from 'features/user/models/user.model';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { FollowService } from 'shared/services/db/follower.service';

export const UserService = {
  createUser: async (data: IUserDocument): Promise<void> => {
    await UserModel.create(data);
  },
  getUserByUserId: async (userId: string | ObjectId | undefined): Promise<IUserDocument> => {
    return (await UserModel.findById(userId).lean()) as IUserDocument;
  },
  getAllUsers: async (excludedUserId: string, skip: number, limit: number): Promise<IUserDocument[]> => {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(excludedUserId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: UserService.aggregateProject() }
    ]);
    return users;
  },

  getTotalUsersCountInDB: async (): Promise<number> => {
    const totalCount = await UserModel.find({}).countDocuments();
    return totalCount;
  },
  getUserById: () => {},
  /* get random users that a specific user doesn't follow */
  getRandomUsers: async (userId: string): Promise<IUserDocument[]> => {
    const randomUsers: IUserDocument[] = [];
    const users = await UserService.getAllUsers(userId, 0, 10);
    const followingUsers = await FollowService.getFollowingUsers(new mongoose.Types.ObjectId(userId));
    const followingUsersIds = followingUsers.map((followingUser) => followingUser._id?.toString());

    for (const user of users) {
      const followingUserIndex = followingUsersIds.indexOf(user._id.toString());
      if (followingUserIndex < 0) {
        randomUsers.push(user);
      }
    }
    return randomUsers;
  },

  searchUsers: async (regex: RegExp): Promise<ISearchUser[]> => {
    const users = await AuthModel.aggregate([
      { $match: { username: regex } },
      { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$user._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: '$user.profilePicture'
        }
      }
    ]);

    return users;
  },
  /* update only basic user info fields: work, shool, quote, location */
  updateBasicUserInfo: async (userId: string, info: IBasicInfo): Promise<void> => {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          work: info.work,
          school: info.school,
          quote: info.quote,
          location: info.location
        }
      }
    ).exec();
  },
  /* update the user social links: {"facebook":"","instagram":"","twitter":"","youtube":""} */
  updateUserSocialLinks: async (userId: string, links: ISocialLinks): Promise<void> => {
    await UserModel.updateOne(
      {
        _id: userId
      },
      { $set: { social: links } }
    ).exec();
  },

  /* update the user notification settings: {"messages":true,"reactions":true,"comments":true,"follows":true} */
  updateUserNotificationSettings: async (userId: string, notificationSettings: INotificationSettings): Promise<void> => {
    await UserModel.updateOne(
      {
        _id: userId
      },
      { $set: { notifications: notificationSettings } }
    ).exec();
  },

  aggregateProject: () => {
    return {
      _id: 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
};
