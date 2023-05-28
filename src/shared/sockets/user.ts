import { ILogin, ISocketData } from 'features/user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

/**
 * Listens to a Socket.IO server instance for incoming 'reaction' and 'comment' events,
 * and emits corresponding 'update like' and 'update comment' events to all connected clients.
 * @param io - The Socket.IO server instance to listen to.
 * !data.userId === username of the user
 */
export const listenToSocketIoUser = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    /* keep track when an user is online */
    socket.on('setup', (data: ILogin) => {
      addClientToMap(data.userId, socket.id);
      addUsers(data.userId);
      io.emit('user online', users);
    });

    socket.on('block user', (data: ISocketData) => {
      io.emit('blocked user id', data);
    });

    socket.on('unblock user', (data: ISocketData) => {
      io.emit('unblocked user id', data);
    });
    /* keep track when an user is offline */
    socket.on('disconnect', () => {
      removeClientFromMap(socket.id, io);
    });
  });
};

export const connectedUsersMap: Map<string, string> = new Map();
let users: string[] = [];
/* helper function used to push into the map the new online user */
const addClientToMap = (userId: string, socketId: string): void => {
  if (!connectedUsersMap.has(userId)) {
    connectedUsersMap.set(userId, socketId);
  }
};
/* helper function used to remove from the map the offline user */
const removeClientFromMap = (socketId: string, socketIoInstance: Server): void => {
  if (Array.from(connectedUsersMap.values()).includes(socketId)) {
    const disconnectedUser: [string, string] = [...connectedUsersMap].find((user: [string, string]) => user[1] === socketId) as [
      string,
      string
    ];
    connectedUsersMap.delete(disconnectedUser[0]);
    removeUser(disconnectedUser[0]);
    socketIoInstance.emit('user online', users);
  }
};
/* helper used to add specific user in the users list */
const addUsers = (username: string): void => {
  if (!users.includes(username)) {
    users.push(username);
  }
};

/* helper used to remove a specific user from the users list */
const removeUser = (username: string) => {
  users = users.filter((name) => name !== username);
};
