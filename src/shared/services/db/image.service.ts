import { IFileImageDocument } from '@src/features/image/interfaces/image.interface';
import { ImageModel } from '@src/features/image/models/image.model';
import { UserModel } from '@src/features/user/models/user.model';
import mongoose from 'mongoose';

interface IProfilePicure {
  userId: string;
  url: string;
  imgId: string;
  imgVersion: string;
}

interface IImageOrBackgroundImage {
  userId: string;
  imgId: string;
  imgVersion: string;
  type: 'profile' | 'background' | '';
}

export const ImageService = {
  /** Function for changing the user profile picture in mongoDB */
  addUserProfilePictureToDB: async ({ userId, url, imgId, imgVersion }: IProfilePicure): Promise<void> => {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
    await ImageService.addImage({ userId, imgId, imgVersion, type: 'profile' });
  },
  /** Function for changing the user background picture in mongoDB */
  addBackgroundImageToDB: async ({ userId, imgId, imgVersion }: IProfilePicure): Promise<void> => {
    await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
    await ImageService.addImage({ userId, imgId, imgVersion, type: 'background' });
  },
  /** Function for removing a specific image form mongoDB */
  removeImageFromDB: async (imgId: string): Promise<void> => {
    await ImageModel.deleteOne({ _id: imgId }).exec();
  },
  /** Function to fetch an image by backgroundId mongoDB */
  getImageByBackgroundId: async (bgImageId: string): Promise<IFileImageDocument> => {
    const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
    return image;
  },
  /** Function fetch all the images assigned to a specific user from mongoDB */
  getImages: async (userId: string): Promise<IFileImageDocument[]> => {
    const images: IFileImageDocument[] = await ImageModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
    return images;
  },
  /** Function for updating the Image collection depending if image is "profile" or "background" */
  addImage: async ({ userId, imgId, imgVersion, type }: IImageOrBackgroundImage): Promise<void> => {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }
};
