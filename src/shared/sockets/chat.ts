import { iSenderReceiver } from 'features/chat/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { connectedUsersMap } from './user';

/**
 * Listens to a Socket.IO server instance for chat events
 */
export const listenToSocketIoChat = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('join room', (users: iSenderReceiver) => {
      const { senderName, receiverName } = users;
      const senderSocketId: string = connectedUsersMap.get(senderName) as string;
      const receiverSocketId: string = connectedUsersMap.get(receiverName) as string;
      socket.join(senderSocketId);
      socket.join(receiverSocketId);
    });
  });
};
