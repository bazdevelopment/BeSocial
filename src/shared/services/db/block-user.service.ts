import { UserModel } from '@src/features/user/models/user.model';
import mongoose from 'mongoose';
import { PushOperator } from 'mongodb';

export const BlockOrUnblockUserService = {
  /**
   * update the necessary fields from user in mongoDB when a used is being blocked = blocked & blockedBy
   */
  blockUser: async (userId: string, followerId: string): Promise<void> => {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId, blocked: { $ne: new mongoose.Types.ObjectId(followerId) } },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId, blockedBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  },
  /**
   * update the necessary fields from user in mongoDB when a used is being unblocked = blocked & blockedBy
   */
  unblockUser: async (userId: string, followerId: string): Promise<void> => {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }
};
