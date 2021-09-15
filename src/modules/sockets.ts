import logger from '..//utils/logger';
import { Server, Socket } from 'socket.io';
import {
  createGameRoom,
  gameEvents,
  gameInfo,
  joinGameRoom,
  startGameRoom,
} from './game/game.events';

export default (io: Server) => {
  logger.info('⛏ Configure Sockets');
  io.on('connection', (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    socket.on(gameEvents.createGame, async username => {
      logger.info(`Create Game ${username}`);
      createGameRoom({ io, socket }, username, socket.id);
    });

    socket.on(gameEvents.joinGame, (joinTag, username) => {
      logger.info(`Join ${joinTag} ${username}`);
      joinGameRoom({ io, socket }, joinTag, username, socket.id);
    });

    socket.on(gameEvents.infoGame, gameId => {
      logger.info(`Info Game ${gameId}`);
      gameInfo({ io, socket }, gameId);
    });

    socket.on(gameEvents.startGame, gameId => {
      console.log(`Start Game ${gameId}`);
      startGameRoom({ io, socket }, socket.id, gameId);
    });
  });
};
