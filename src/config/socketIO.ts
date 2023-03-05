import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { createServer } from 'http';
import { HTTP_METHODS } from 'constants/httpMethods';

/**Function used to make to connection between Redis and SocketIO */
export const createSocketIoServer = async (): Promise<Server> => {
  const httpServer = createServer();

  const io: Server = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: HTTP_METHODS
    }
  });

  const pubClient = createClient({ url: process.env.REDIS_HOST });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  return io;
};
