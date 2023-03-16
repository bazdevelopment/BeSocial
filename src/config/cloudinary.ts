import cloudinary from 'cloudinary';

const cloudinaryConfig = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET
  });
};
export default cloudinaryConfig;
