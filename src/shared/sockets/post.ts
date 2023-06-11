import { ICommentDocument } from '@src/features/comment/interfaces/comment.interface';
import { IReactionDocument } from '@src/features/reaction/interfaces/reaction.interface';
import { Server, Socket } from 'socket.io';

/**
 * Listens to a Socket.IO server instance for incoming 'reaction' and 'comment' events,
 * and emits corresponding 'update like' and 'update comment' events to all connected clients.
 * @param io - The Socket.IO server instance to listen to.
 */
export const listenToSocketIoPost = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('reaction', (reaction: IReactionDocument) => {
      io.emit('update like', reaction);
    });

    socket.on('comment', (data: ICommentDocument) => {
      io.emit('update comment', data);
    });
  });
};
