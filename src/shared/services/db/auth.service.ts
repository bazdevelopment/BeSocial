import { IAuthDocument } from 'features/auth/interfaces/auth.interface';
import { AuthModel } from 'features/auth/models/auth.model';

export const AuthService = {
  createAuthUser: async (data: IAuthDocument): Promise<void> => {
    await AuthModel.create(data);
  },
  getUserByEmail: async (email: string): Promise<IAuthDocument> => {
    return (await AuthModel.findOne({ email })) as IAuthDocument;
  }
};
