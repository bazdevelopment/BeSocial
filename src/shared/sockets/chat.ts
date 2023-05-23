import { iSenderReceiver } from 'features/chat/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';

/**
 * Listens to a Socket.IO server instance for chat events
 */
export const listenToSocketIoChat = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('join room', (data: iSenderReceiver) => {
      console.log('data from socket chat', data);
    });
  });
};
