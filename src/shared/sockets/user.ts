import { ISocketData } from 'features/user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

/**
 * Listens to a Socket.IO server instance for incoming 'reaction' and 'comment' events,
 * and emits corresponding 'update like' and 'update comment' events to all connected clients.
 * @param io - The Socket.IO server instance to listen to.
 */
export const listenToSocketIoUser = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('block user', (data: ISocketData) => {
      io.emit('blocked user id', data);
    });

    socket.on('unblock user', (data: ISocketData) => {
      io.emit('unblocked user id', data);
    });
  });
};
