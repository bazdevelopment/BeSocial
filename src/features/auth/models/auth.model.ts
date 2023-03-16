import { hash, compare, genSalt } from 'bcryptjs';
import { model, Model, Schema } from 'mongoose';
import { IAuthDocument } from '../interfaces/auth.interface';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
  {
    username: { type: String },
    userId: { type: Schema.Types.ObjectId, auto: true },
    email: { type: String, unique: true },
    password: { type: String },
    avatarImage: { type: String },
    avatarColor: { type: String },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toObject: {
      transform(_, returnedJSON) {
        delete returnedJSON.password; /* removes the password field from the returned JSON object for security reasons */
        return returnedJSON;
      }
    },
    timestamps: true /* Automatically create createdAt timestamp */
  }
);
/**
 * pre is a middleware that can be called before sending the user object to MongoDB database
 * modified and hashes the password before saving to MongoDB database
 */
authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const salt = await genSalt(SALT_ROUND);
  const hashedPassword: string = await hash(this.password as string, salt);
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  const hashedPassword: string = this.password;
  return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  const salt = await genSalt(SALT_ROUND);
  return hash(password, salt);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
export { AuthModel };
