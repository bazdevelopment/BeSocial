import { IAuthDocument } from '@src/features/auth/interfaces/auth.interface';
import { AuthModel } from '@src/features/auth/models/auth.model';

export const AuthService = {
  createAuthUser: async (data: IAuthDocument): Promise<void> => {
    await AuthModel.create(data);
  },
  getUserByEmail: async (email: string): Promise<IAuthDocument> => {
    return (await AuthModel.findOne({ email })) as IAuthDocument;
  },
  updatePasswordToken: async (userId: string, token: string, tokenExpirationDate: number) => {
    return await AuthModel.updateOne(
      { _id: userId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpirationDate
      }
    );
  },
  /**
   * Get the user from MongoDB database using auth token as identifier
   * passwordResetExpires: { $gt: Date.now() } -> if the passwordResetExpires is still greater that Date.now() means that token is still valid
   * if the matching criteria are not met, user will be null
   * ! Token is valid 1 hour
   */
  getUserByPasswordToken: async (token: string): Promise<IAuthDocument | null> => {
    const user: IAuthDocument | null = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    return user;
  }
};
