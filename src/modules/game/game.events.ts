import * as gameService from './game.service';
import { IOEvents } from '../socket/socket.events';
import { Server, Socket } from 'socket.io';
import Game from './game.model';
import { GameStatus } from './game.interfaces';

type SocketArg = {
  socket?: Socket;
  io?: Server;
};

export const gameEvents = {
  createdGame: 'game:created',
  createGame: 'game:create',

  joinedGame: 'game:joined',
  joinGame: 'game:join',
  playerJoined: 'player:joined',

  startedGame: 'game:started',
  startGame: 'game:start',
  finishedGame: 'game:finished',
  infoGame: 'game:info',
  moveGame: 'game:move',
  cardDrawGame: 'game:cardDraw',
};

export const gameInfo = async ({ socket }: SocketArg, gameId) => {
  const game = await gameService.findGame(gameId);

  if (game) {
    socket.emit(gameEvents.infoGame, {
      joinTag: game.joinTag,
      isCreator: game.currentPlayerSocketId === socket.id,
      gameStatus: game.gameStatus,
    });
  } else {
    socket.emit(IOEvents.error, { message: 'Game Not Found' });
  }
};

export const joinGameRoom = async (
  { io, socket }: SocketArg,
  joinTag: string,
  username: string,
  socketId: string,
) => {
  const taggedGame = await Game.findOne({ joinTag });

  if (taggedGame) {
    if (taggedGame.gameStatus !== GameStatus.Pending) {
      socket.emit(IOEvents.error, {
        message: `Can\'t join game already started`,
      });
    } else {
      const taken = await gameService.usernameTaken(taggedGame.id, username);
      if (taken) {
        socket.emit(IOEvents.error, { message: 'Username already taken' });
      } else {
        await gameService.joinGame(taggedGame.id, { socketId, username });
        socket.join(taggedGame.id);
        socket.emit(gameEvents.joinedGame, taggedGame.id);
        io.in(taggedGame.id).emit(gameEvents.playerJoined, {
          player: `${username} joined the game`,
          playersCount: taggedGame.players.length + 1,
        });
      }
    }
  } else {
    socket.emit(IOEvents.error, {
      message: `Game with tag ${joinTag} not found`,
    });
  }
};

export const createGameRoom = async (
  { socket }: SocketArg,
  username?: string,
  socketId?: string,
) => {
  try {
    const newGame = await gameService.createGame(socketId, username);
    const gameId = newGame.id;

    socket.join(gameId);
    socket.emit(gameEvents.createdGame, {
      id: `${gameId}`,
      joinTag: newGame.joinTag,
    });
  } catch (err) {
    socket.emit(IOEvents.error, {
      message: 'Error creating game try again',
    });
  }
};

// const validateMove = ({ socket }, game, movedDeck) => {
//   const [passed, err] = validateCardDraw(
//     game.currentSuite,
//     game.currentValue,
//     movedDeck
//   );
//   if (!passed) {
//     console.log('Handle crazy');
//     socket.emit(IOEvents.error, err);
//     playerMoveHandlers.onCrazy({ socket }, game);
//   }

//   return passed;
// };

// const validateGame = ({ socket }, game) => {
//   if (game.gameStatus !== 'STARTED') {
//     socket.emit(IOEvents.error, cardValMessages.gameNotStarted());
//     return false;
//   }
//   return true;
// };

// export const makeGameMove = async (
//   { io, socket },
//   { gameId, movedDeck, asSuite }
// ) => {
//   const game = await gameService.findGame(gameId);
//   const cardPlayerSocketId = game.currentPlayerSocketId;
//   if (game) {
//     let validated = validateMove({ io, socket }, game, movedDeck);
//     validated = validated && validateGame({ socket }, game);

//     if (validated) {
//       if (deckStats.isEmpty(movedDeck)) {
//         await playerMoveHandlers.onEmpty({ io, socket }, game);
//       } else if (deckStats.isJoker(movedDeck)) {
//         await playerMoveHandlers.onJoker({ io, socket }, game, movedDeck[0]);
//       } else if (deckStats.isDirectionChanger(movedDeck)) {
//         await playerMoveHandlers.onDirectionChanger({ io }, game, movedDeck[0]);
//       } else if (deckStats.isSkipper(movedDeck)) {
//         await playerMoveHandlers.onSkipper({ io }, game, movedDeck[0]);
//       } else if (deckStats.isAce(movedDeck)) {
//         await playerMoveHandlers.onAce({ io }, game, movedDeck[0]);
//       } else if (deckStats.isSuiteChanger(movedDeck)) {
//         await playerMoveHandlers.onSuiteChanger(
//           { io },
//           game,
//           movedDeck[0],
//           asSuite
//         );
//       } else {
//         await playerMoveHandlers.onRestMove({ io }, game, movedDeck);
//       }

//       await finalizeEvent.finalizeMove(
//         { io, cardPlayerSocketId },
//         game,
//         movedDeck
//       );
//     }
//   }
// };

// export const drawCardRoom = async ({ socket }, gameId) => {
//   const curGame = await gameService.findGame(gameId);
//   if (curGame) {
//     await playerMoveHandlers.onDraw({ socket }, curGame);
//   }
// };

// export const startGameRoom = async ({ io, socket }, { socketId, gameId }) => {
//   const curGame = await gameService.findGame(gameId);

//   if (curGame) {
//     // if (curGame.gameStatus !== 'PENDING') {
//     //   socket.emit(IOEvents.error, { message: 'Game already started' });
//     // } else if (curGame.currentPlayerSocketId !== socketId) {
//     //   socket.emit(IOEvents.error, {
//     //     message: 'Unauthorized to start game',
//     //   });
//     // } else if (curGame.players.length < 2) {
//     //   socket.emit(IOEvents.error, {
//     //     message: 'Must have more than 1 player to start game',
//     //   });
//     // } else {
//     const gameStart = (await gameService.startGame(curGame.id)).toJSON();
//     io.in(curGame.id).emit(gameEvents.startedGame, {
//       currentPlayerSocketId: gameStart.currentPlayerSocketId,
//       players: gameStart.players,
//       topCard: gameStart.topCard,
//       direction: gameStart.direction,
//     });
//     gameStart.players.forEach((player) => {
//       io.to(player.socketId).emit(playerEvents.playerCards, player.cards);
//     });

//     io.in(curGame.id).emit(
//       playerEvents.playerCurrent,
//       gameService.getPlayer(gameStart.players, gameStart.currentPlayerSocketId)
//     );

//     // TODO: Remove
//     // io.in(curGame.id).emit(gameEvents.finishedGame, 'mal');
//     // io.in(curGame.id).emit(cardEvents.cardLeft, 'titan');
//     // }
//   } else {
//     socket.emit(IOEvents.error, { message: 'Game not found' });
//   }
// };
