import Joi, { ObjectSchema } from 'joi';

const postScheme: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, '')
});

const postImageScheme: ObjectSchema = Joi.object().keys({
  image: Joi.string().required().messages({
    'any.required': 'Image is required',
    'string.empty': 'Image should not be empty'
  }),
  post: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, '')
});

const postVideoScheme: ObjectSchema = Joi.object().keys({
  video: Joi.string().required().messages({
    'any.required': 'Video is required',
    'string.empty': 'Video should not be empty'
  }),
  image: Joi.string().optional().allow(null, ''),
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, '')
});

export { postScheme, postImageScheme, postVideoScheme };
