import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '../interfaces/post.interface';
import { getPostsFromCache, getPostsWithImagesFromCache, getTotalPostsInCache } from '@src/shared/services/redis/post.cache';
import { PostService } from '@src/shared/services/db/post.service';

const PAGE_SIZE = 10;

/**
 * This function is designed to fetch a list of posts from a cache or a database, based on the requested page number.
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const page: number = Number(req.params.page) || 1;
  const skip: number = (page - 1) * PAGE_SIZE;
  const limit = PAGE_SIZE;

  const [postsFromCache, totalPostsFromCache] = await Promise.all<[IPostDocument[], number]>([
    getPostsFromCache('posts', skip, limit),
    getTotalPostsInCache()
  ]);

  if (postsFromCache?.length) {
    res.status(HTTP_STATUS.OK).json({ message: 'Successfully fetched posts', posts: postsFromCache, totalPosts: totalPostsFromCache });
  } else {
    const [postsFromDb, totalPostsFromDb] = await Promise.all([
      PostService.getPostsFromDB({}, skip, limit, { createdAt: -1 }),
      PostService.getPostsCount()
    ]);
    res.status(HTTP_STATUS.OK).json({ message: 'Successfully fetched posts', posts: postsFromDb, totalPosts: totalPostsFromDb });
  }
};

/**
 * This function is designed to fetch a list of posts with images from a cache or a database, based on the requested page number and a query
 */
export const getPostsWithImages = async (req: Request, res: Response): Promise<void> => {
  const page: number = Number(req.params.page) || 1;
  const skip: number = (page - 1) * PAGE_SIZE;
  const limit = PAGE_SIZE;

  const [postsWithImagesFromCache, totalPostsFromCache] = await Promise.all([
    getPostsWithImagesFromCache('posts', skip, limit),
    getTotalPostsInCache()
  ]);

  if (postsWithImagesFromCache?.length) {
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Successfully fetched posts with images', posts: postsWithImagesFromCache, totalPosts: totalPostsFromCache });
  } else {
    const [postsWithImagesFromDb, totalPostsFromDb] = await Promise.all([
      PostService.getPostsFromDB({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 }),
      PostService.getPostsCount()
    ]);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Successfully fetched posts with images', posts: postsWithImagesFromDb, totalPosts: totalPostsFromDb });
  }
};
