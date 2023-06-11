import { Response } from 'express';
import { IAuthPayload } from '@src/features/auth/interfaces/auth.interface';

/* Helper for mocking the post request */
export const postMockRequest = (body: IBody, currentUser?: IAuthPayload | null, params?: IParams) => ({
  body,
  params,
  currentUser
});

/* Helper for mocking the post response */
export const postMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const newPostMock: IBody = {
  bgColor: '#f44336',
  post: 'how are you?',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: '',
  privacy: 'Public',
  profilePicture: 'http://place-hold.it/500x500',
  feelings: 'happy'
};

interface IParams {
  postId?: string;
  page?: string;
}

interface IBody {
  bgColor: string;
  post?: string;
  gifUrl?: string;
  image?: string;
  privacy?: string;
  imgId?: string;
  imgVersion?: string;
  profilePicture?: string;
  feelings?: string;
}
