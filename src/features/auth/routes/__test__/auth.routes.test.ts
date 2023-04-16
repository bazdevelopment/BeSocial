import supertest from 'supertest';

jest.mock('shared/services/queues/user.queue');
jest.mock('shared/services/queues/user.queue');
jest.mock('shared/services/queues/base.queue');
jest.mock('shared/services/redis/user.cache');
jest.mock('features/auth/models/auth.model');

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

describe('signup route', () => {
  it('should throw an error if username is not provided', async () => {
    const response = await supertest('http://localhost:8000/api/v1/auth').post('/signup').send({
      username: '',
      password: '1234',
      email: 'Marian@yahoo.com',
      avatarColor: 'red',
      avatarImage: 'data:image/png;base64,iVBORw0KGgoAAA'
    });

    expect(response.body.message).toEqual('Username is a required field');
    expect(response.status).toEqual(500);
  });
});
