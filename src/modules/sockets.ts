import logger from '..//utils/logger';
import { Server, Socket } from 'socket.io';
import {
  createGameRoom,
  drawCardRoom,
  gameEvents,
  gameInfo,
  joinGameRoom,
  makeGameMove,
  startGameRoom,
} from './game/game.events';
import Game from './game/game.model';
import { cardEvents } from './card/card.events';
import { ICard } from './game/game.interfaces';

export default (io: Server) => {
  logger.info('⛏ Configure Sockets');
  io.on('connection', async (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    // /** Remove Start */
    // let game = await Game.findOne();
    // const { players } = game;
    // players[0].socketId = socket.id;
    // game = await Game.findByIdAndUpdate(
    //   game.id,
    //   {
    //     $set: { currentPlayerSocketId: socket.id, players },
    //   },
    //   { new: true },
    // );

    // socket.on(gameEvents.startGame, async () => {
    //   logger.info('Start game');
    //   //   const game = await Game.findOne();
    //   socket.join(game.id);

    //   io.in(game.id).emit(gameEvents.startedGame, {
    //     currentPlayerSocketId: game.currentPlayerSocketId,
    //     players: game.players,
    //     topCard: game.topCard,
    //     direction: game.direction,
    //   });
    //   socket.emit(gameEvents.playerCards, game.players[0].cards);
    //   // game.players.forEach(player => {
    //   // io.to(player.socketId).emit(gameEvents.playerCards, player.cards);
    //   // });
    //   io.in(game.id).emit(cardEvents.cardTop, game.topCard);
    //   io.in(game.id).emit(cardEvents.cardCurrentSuite, game.currentSuite);
    //   io.in(game.id).emit(cardEvents.cardDirection, game.direction);
    //   io.in(game.id).emit(gameEvents.playerCount, game.players.length);
    //   io.in(game.id).emit(gameEvents.playerCurrent, {
    //     username: 'titan',
    //     socketId: socket.id,
    //   });
    // });

    // socket.on(gameEvents.cardMoveGame, (gameId, movedDeck, asSuite) => {
    //   // console.log(`Game Move`, {
    //   //   gameId,
    //   //   movedDeck: JSON.parse(movedDeck),
    //   //   asSuite,
    //   // });
    //   makeGameMove(
    //     { io, socket },
    //     gameId,
    //     JSON.parse(movedDeck) as ICard[],
    //     asSuite,
    //   );
    // });

    // socket.on(gameEvents.cardDrawGame, gameId => {
    //   logger.info('Card Draw');
    //   drawCardRoom({ io, socket }, gameId);
    // });

    /** Remove end */

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

    socket.on(gameEvents.cardMoveGame, (gameId, movedDeck, asSuite) => {
      // console.log(`Game Move`, {
      //   gameId,
      //   movedDeck: JSON.parse(movedDeck),
      //   asSuite,
      // });
      makeGameMove(
        { io, socket },
        gameId,
        JSON.parse(movedDeck) as ICard[],
        asSuite,
      );
    });

    socket.on(gameEvents.cardDrawGame, gameId => {
      logger.info('Card Draw');
      drawCardRoom({ io, socket }, gameId, socket.id);
    });
  });
};
