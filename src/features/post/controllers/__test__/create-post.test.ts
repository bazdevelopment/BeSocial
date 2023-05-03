import { Request, Response } from 'express';
import { authUserPayload } from 'mocks/auth.mock';
import { newPostMock, postMockRequest, postMockResponse } from 'mocks/post.mock';
import * as postServer from 'config/socketIO';
import { Server } from 'socket.io';
// import * as PostQueue from 'shared/services/queues/post.queue';
import { createPost } from '../create-post';
import * as postCache from 'shared/services/redis/post.cache';
import { PostWorker } from 'shared/workers/post.worker';
// import { createBaseQueue } from 'shared/services/queues/base.queue';

jest.useFakeTimers();

jest.mock('shared/services/redis/post.cache');

const mockAddJobToQueue = jest.fn();
const mockProcessJobQueue = jest.fn();
jest.mock('shared/services/queues/base.queue', () => {
  return {
    createBaseQueue: () => ({
      addJobToQueue: mockAddJobToQueue,
      processJob: mockProcessJobQueue
    })
  };
});

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockReturnValue({
        public_id: 'dummyPublicId',
        version: 'dummyVersion'
      })
    },
    config: jest.fn()
  }
}));

Object.defineProperties(postServer, {
  io: {
    value: new Server(),
    writable: true
  }
});

describe('Post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send the correct json response', async () => {
    const req: Request = postMockRequest(newPostMock, authUserPayload) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postServer.io, 'emit');
    const savePostToCacheSpy = jest.spyOn(postCache, 'savePostToCache');

    await createPost(req, res);

    const createdPost = savePostToCacheSpy.mock.calls[0];
    expect(postServer.io.emit).toHaveBeenCalledWith('add post', createdPost?.[0]);
    expect(mockAddJobToQueue).toHaveBeenCalledWith('addPostToDB', {
      key: req.currentUser?.userId,
      value: createdPost?.[0]
    });
    expect(mockProcessJobQueue).toHaveBeenCalledWith('addPostToDB', 5, PostWorker.addPostToDB);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post created successfully! ✅'
    });
  });
});
