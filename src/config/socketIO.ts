import { Server } from 'socket.io';
import { createClient } from 'redis';
import http from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { HTTP_METHODS } from '@src/constants/httpMethods';

// Define a global variable for the socket.io server instance
export let io: Server;

/**Function used to make to connection between Redis and SocketIO */
export const createSocketIoServer = async (httpServer: http.Server): Promise<Server> => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: HTTP_METHODS
    }
  });
  /* Create Redis clients and connect them */
  const pubClient = createClient({ url: process.env.REDIS_HOST });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  /* Use Redis for socket.io's adapter */
  io.adapter(createAdapter(pubClient, subClient));
  return io;
};

/**
 * Returns the socket.io server instance.
 * @returns The socket.io server instance.
 */
export const getIOInstance = () => {
  return io;
};
