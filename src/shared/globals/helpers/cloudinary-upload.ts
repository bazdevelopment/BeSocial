import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

/**
 * Function used to upload an image into Cloudinary
 * @param file (required): a string representing the file to be uploaded.
 * @param public_id  (optional): a string representing the public ID of the file in the cloudinary storage.
 * @param overwrite (optional): a boolean indicating whether to overwrite the file if it already exists in the cloudinary storage.
 * @param invalidate optional): a boolean indicating whether to invalidate the CDN cache for the file after uploading.
 */
export function uploadImageToCloudinary(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      { public_id, overwrite, invalidate },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}

/**
 * Function used to upload a video into Cloudinary
 * @param file (required): a string representing the file to be uploaded.
 * @param public_id  (optional): a string representing the public ID of the file in the cloudinary storage.
 * @param overwrite (optional): a boolean indicating whether to overwrite the file if it already exists in the cloudinary storage.
 * @param invalidate optional): a boolean indicating whether to invalidate the CDN cache for the file after uploading.
 */
export function uploadVideoToCloudinary(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      { resource_type: 'video', chunk_size: 50000, public_id, overwrite, invalidate },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}
