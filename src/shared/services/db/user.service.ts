import { IUserDocument } from 'features/user/interfaces/user.interface';
import { UserModel } from 'features/user/models/user.model';
import { ObjectId } from 'mongodb';

export const UserService = {
  createUser: async (data: IUserDocument): Promise<void> => {
    await UserModel.create(data);
  },
  getUserByUserId: async (userId: string | ObjectId): Promise<IUserDocument> => {
    return (await UserModel.findById(userId)) as IUserDocument;
  }
};
