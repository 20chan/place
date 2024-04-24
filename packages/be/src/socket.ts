import type { Server } from 'http';
import socketIo from 'socket.io';

export const createSocket = (server: Server) => {
  const ioConnect = new socketIo.Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket'],
    path: '/api/socket',
    addTrailingSlash: false,
    allowEIO3: true,
  });

  return ioConnect;
};