import cloudinary from 'cloudinary';
/**
 *  This function initializes the Cloudinary configuration for the application by requiring 'cloudinary' module and calling its config() method by passing an object that includes your cloud_name, api_key and api_secret as properties.
 */
const cloudinaryConfig = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET
  });
};
export default cloudinaryConfig;
