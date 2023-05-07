import express, { json, urlencoded, Express, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import 'express-async-errors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { createSocketIoServer } from './config/socketIO';
import { Server } from 'socket.io';
import { errorHandler, notFound } from './middleware/error-middleware';
import { HTTP_METHODS } from './constants/httpMethods';
import cloudinaryConfig from 'config/cloudinary';
import authRoutes from './features/auth/routes/auth.routes';
import postsRoutes from './features/post/routes/post.routes';
import postReactionRoutes from './features/reaction/routes/reaction.routes';

import { connectRedisCache } from 'shared/services/redis/redis.connection';
import { serverAdapter } from 'shared/services/queues/base.queue';
import { listenToSocketIoPost } from 'shared/sockets/post';
/* Enabling .env file */
dotenv.config();
const PORT = process.env.PORT;
export const app: Express = express();

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
/* Make sure that connection with MongoDB database is ready */
connectDB();
/* Make sure that connection with Redis server is ready */
connectRedisCache();
/* Make sure that connection with Cloudinary is ready */
cloudinaryConfig();
/* Make sure that connection with SocketIO and Redis is ready */
createSocketIoServer().then((io: Server) => {
  console.log('⚡️ [SocketIO] SocketIO & Redis connection done ✅');
  listenToSocketIoPost(io);
});

/* Test if server is running */
app.get('/', (_req: Request, res: Response) => {
  res.send('API IS RUNNING...');
});
app.use('/queues', serverAdapter.getRouter());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/reaction', postReactionRoutes);

/* use Middleware for edge cases */
app.use(notFound);
app.use(errorHandler);
/* Listen when server starts */
app.listen(PORT, () => console.log(`⚡️ [server]: running on port ${PORT}`));
