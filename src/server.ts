import express, { json, urlencoded, Express, Request, Response, Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import cookieSession from 'cookie-session';
import compression from 'compression';
import 'express-async-errors';
import dotenv from 'dotenv';
import apiStats from 'swagger-stats';
import connectDB from '@src/config/db';
import { createSocketIoServer } from '@src/config/socketIO';
import { Server } from 'socket.io';
import { errorHandler, notFound } from '@src/middleware/error-middleware';
import cloudinaryConfig from '@src/config/cloudinary';
import authRoutes from '@src/features/auth/routes/auth.routes';
import postsRoutes from '@src/features/post/routes/post.routes';
import postReactionRoutes from '@src/features/reaction/routes/reaction.routes';
import postCommentRoutes from '@src/features/comment/routes/comment.routes';
import userFollowRoutes from '@src/features/follower/routes/follower.routes';
import userBlockRoutes from '@src/features/block/routes/block.routes';
import notificationRoutes from '@src/features/notification/routes/notification.routes';
import imagesRoutes from '@src/features/image/routes/image.routes';
import chatRoutes from '@src/features/chat/routes/chat.routes';
import userRoutes from '@src/features/user/routes/user.routes';

import { connectRedisCache } from '@src/shared/services/redis/redis.connection';
import { serverAdapter } from '@src/shared/services/queues/base.queue';
import { listenToSocketIoPost } from '@src/shared/sockets/post';
import { listenToSocketIoFollower } from '@src/shared/sockets/follower';
import { listenToSocketIoUser } from '@src/shared/sockets/user';
import { listenToSocketIoChat } from '@src/shared/sockets/chat';
import { HTTP_METHODS } from '@src/constants/httpMethods';
/* Enabling .env file */
dotenv.config();
const PORT = process.env.PORT;
let app: Express = express();

/**
 * logging any request that is made to the server. E.g. GET / 304 4.140 ms - -
 */
app.use(morgan('dev'));
/**
 * compression is a middleware function that compresses the response bodies for all HTTP responses sent from the server,
 * which can reduce the size of the response and improve the application's performance.
 */
app.use(compression());
/**
 * json is a middleware function that parses incoming JSON payloads sent in the body of HTTP requests.
 * The limit option specifies the maximum size of the JSON payload that can be received by the server
 */

app.use(json({ limit: '50mb' }));
/**
 * This allows the application to handle incoming URL-encoded form data in HTTP requests up to the specified limit.\
 * URL-encoded form data is a common format used to send data in the body of an HTTP POST request, where key-value pairs are represented as key=value and separated by an ampersand (&).
 */
app.use(urlencoded({ extended: true, limit: '50mb' }));

app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET_KEY_ONE!, process.env.SECRET_KEY_ONE!],
    maxAge: 24 * 7 * 3600000,
    secure: process.env.NODE_ENV !== 'development'
  })
);

app.use(
  cors({
    /* origin: if it is set to '*'m any domain can access the server resources
     setting "*" as the allowed origin could be a security risk in some cases
     */
    origin: process.env.CLIENT_URL,
    credentials: true /* allows cookies and other user credentials to be sent along with the requests */,
    optionsSuccessStatus: 200 /* sets the status code to use for successful  */,
    methods: HTTP_METHODS /* This option specifies the HTTP methods that are allowed for cross-origin requests */
  })
);
/* Prevent parameter population */
app.use(hpp());
/* Secure header HTTP */
app.use(helmet());
/**
 * enabled api monitoring using 'swagger-stats' library
 * consider using another library like grafana/data dog for production grade environment
 */
app.use(
  apiStats.getMiddleware({
    uriPath: '/api-monitoring'
  })
);
/* Make sure that connection with MongoDB database is ready */
connectDB();
/* Make sure that connection with Redis server is ready */
connectRedisCache();
/* Make sure that connection with Cloudinary is ready */
cloudinaryConfig();

/* Test if server is running */
app.get('/', (_req: Request, res: Response) => {
  res.send('API IS RUNNING...');
});
app.use('/queues', serverAdapter.getRouter());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/reaction', postReactionRoutes);
app.use('/api/v1/comment', postCommentRoutes);
app.use('/api/v1/follow', userFollowRoutes);
app.use('/api/v1/blocked', userBlockRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/images', imagesRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/user', userRoutes);

/* use Middleware for edge cases */
app.use(notFound);
app.use(errorHandler);
/* Listen when server starts */
const startHttpServer = (app: http.Server) => {
  console.info(`Worker with process id of ${process.pid} has started...`);
  app.listen(PORT, () => console.log(`⚡️ [server]: running on port ${PORT}`));
};

const socketIoConnections = (io: Server) => {
  console.log('⚡️ [SocketIO] SocketIO & Redis connection done ✅');
  listenToSocketIoPost(io);
  listenToSocketIoFollower(io);
  listenToSocketIoUser(io);
  listenToSocketIoChat(io);
};

const startServer = async (app: Application): Promise<void> => {
  // if (!process.env.JWT_TOKEN) {
  //   throw new Error('JWT_TOKEN must be provided');
  // }
  try {
    /* Make sure that server is started*/
    const httpServer: http.Server = new http.Server(app);
    /* Make sure that connection with SocketIO and Redis is ready */
    const socketIO: Server = await createSocketIoServer(httpServer);
    startHttpServer(httpServer);
    socketIoConnections(socketIO);
  } catch (error) {
    console.error(error);
  }
};

// export const initializeServer = () => startServer(app);
startServer(app);
