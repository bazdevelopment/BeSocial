import { IFollowers } from '@src/features/follower/interface/follower.interface';
import { Server, Socket } from 'socket.io';

/**
 * Listens to a Socket.IO server instance for incoming 'reaction' and 'comment' events,
 * and emits corresponding 'update like' and 'update comment' events to all connected clients.
 * @param io - The Socket.IO server instance to listen to.
 */
export const listenToSocketIoFollower = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('unfollow user', (data: IFollowers) => {
      io.emit('remove follower', data);
    });
  });
};
