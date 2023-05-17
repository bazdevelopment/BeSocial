import { Model, Schema, model } from 'mongoose';
import { IFileImageDocument } from '../interfaces/image.interface';

const imageSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
    imgId: { type: String, default: '' },
    imgVersion: { type: String, default: '' }
  },
  {
    timestamps: true /* Automatically create createdAt timestamp */
  }
);

const ImageModel: Model<IFileImageDocument> = model<IFileImageDocument>('Image', imageSchema, 'Image');
export { ImageModel };
