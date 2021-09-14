import logger from '@/utils/logger';
import { Server, Socket } from 'socket.io';

export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);
  });
};
