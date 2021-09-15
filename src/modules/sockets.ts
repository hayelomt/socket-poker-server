import logger from '..//utils/logger';
import { Server, Socket } from 'socket.io';
import { createGameRoom, gameEvents } from './game/game.events';

export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    socket.on(gameEvents.createGame, async username => {
      console.log(`Create Game ${username}`);
      createGameRoom({ socket }, username, socket.id);
    });

    // socket.on(gameEvents.infoGame, (gameId) => {
    //   console.log(`Info Game ${gameId}`);
    //   gameInfo({ socket }, { gameId });
    // });
  });
};
