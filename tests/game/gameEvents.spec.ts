import { expect } from 'chai';
import sinon from 'sinon';
import { stubSocketIO, clearDb, stubSocket, genCards } from '../testUtils';
import * as gameIOEvents from '../../src/modules/game/game.events';
import * as gameService from '../../src/modules/game/game.service';
import Game from '../../src/modules/game/game.model';
import { IOEvents } from '../../src/modules/socket/socket.events';
import { GameStatus } from '../../src/modules/game/game.interfaces';
// const finalizeEvent = require('../../../src/modules/game/finalizeEvent');

const sandbox = sinon.createSandbox();
let io;
let socket;
let finalizeStub;
const username = 'harry';
const socketId = 'wand';

describe('gameIOEvents', () => {
  beforeEach(async () => {
    io = stubSocketIO(sandbox);
    socket = stubSocket(sandbox);
    // finalizeStub = sandbox.stub(finalizeEvent, 'finalizeMove').callsFake(() => {
    // console.log('Finalize Stub');
    // });
    await clearDb();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('gameInfo', () => {
    it('returns info', async () => {
      expect(socket.emit.called).to.be.false;
      const newGame = await gameService.createGame(socketId, username);

      await gameIOEvents.gameInfo({ socket }, newGame.id);

      expect(socket.emit.called).to.be.true;
      expect(
        socket.emit.calledWith(gameIOEvents.gameEvents.infoGame, {
          joinTag: newGame.joinTag,
          isCreator: false,
          gameStatus: newGame.gameStatus,
        }),
      ).to.be.true;
    });
  });

  describe('joinGame', () => {
    it('emits no game with tag for invalid tag', async () => {
      expect(socket.emit.called).to.be.false;

      await gameIOEvents.joinGameRoom({ socket }, 'join', '', '');

      expect(socket.emit.called).to.be.true;
      expect(
        socket.emit.calledWith(IOEvents.error, {
          message: `Game with tag join not found`,
        }),
      ).to.be.true;
    });

    it('emits username already taken', async () => {
      const socketId = 'sock-id';
      const username = 'titan';

      expect(socket.emit.called).to.be.false;

      const newGame = await gameService.createGame(socketId, username);
      await gameIOEvents.joinGameRoom(
        { socket },
        newGame.joinTag,
        username,
        '',
      );

      expect(socket.emit.called).to.be.true;
      expect(
        socket.emit.calledWith(IOEvents.error, {
          message: 'Username already taken',
        }),
      ).to.be.true;
    });

    it('emits game already started', async () => {
      const socketId = 'sock-id';
      const username = 'titan';

      expect(socket.emit.called).to.be.false;

      const newGame = await gameService.createGame(socketId, username);
      await Game.findByIdAndUpdate(newGame.id, {
        $set: { gameStatus: GameStatus.Started },
      });
      await gameIOEvents.joinGameRoom(
        { socket },
        newGame.joinTag,
        username,
        '',
      );

      expect(socket.emit.called).to.be.true;
      expect(
        socket.emit.calledWith(IOEvents.error, {
          message: "Can't join game already started",
        }),
      ).to.be.true;
    });

    it('joins game', async () => {
      const socketId = 'sock-id';
      const username = 'titan';

      expect(socket.emit.called).to.be.false;
      expect(socket.join.called).to.be.false;

      const newGame = await gameService.createGame(socketId, username);
      await gameIOEvents.joinGameRoom(
        { io, socket },
        newGame.joinTag,
        'meet',
        '',
      );

      const games = await Game.find();
      expect(games[0].players.length).to.equal(2);

      expect(socket.join.called).to.be.true;
      expect(io.in.called).to.be.true;
      expect(io.in.calledWith(newGame.id)).to.be.true;
      expect(io.in().emit.called).to.be.true;
      expect(
        io.in().emit.calledWith(gameIOEvents.gameEvents.playerJoined, {
          player: 'meet joined the game',
          playersCount: 2,
        }),
      ).to.be.true;
    });
  });

  describe('createGame', () => {
    it('creates game', async () => {
      expect(socket.emit.called).to.be.false;
      expect(socket.join.called).to.be.false;
      await gameIOEvents.createGameRoom({ socket }, username, socketId);

      const newGame = await Game.find();
      expect(newGame.length).to.equal(1);

      expect(socket.join.calledOnce).to.be.true;
      expect(socket.join.calledWithExactly(newGame[0].id)).to.be.true;
      expect(socket.emit.calledOnce).to.be.true;
      expect(
        socket.emit.calledWith(gameIOEvents.gameEvents.createdGame, {
          id: newGame[0].id,
          joinTag: newGame[0].joinTag,
        }),
      ).to.be.true;
    });

    it('sends create error', async () => {
      expect(socket.emit.called).to.be.false;

      await gameIOEvents.createGameRoom({ socket });

      expect(socket.emit.called).to.be.true;
      expect(
        socket.emit.calledWithExactly(IOEvents.error, {
          message: 'Error creating game try again',
        }),
      ).to.be.true;
    });
  });

  //   describe('makeMove validation', async () => {
  //     const socketId = 'sock-id',
  //       username = 'titan';

  //     it('game no in STARTED session', async () => {
  //       expect(socket.emit.called).to.be.false;

  //       let curGame = await gameService.createGame(socketId, username);
  //       curGame = await Game.findByIdAndUpdate(
  //         curGame.id,
  //         {
  //           $set: { gameStatus: 'FINISHED' },
  //         },
  //         { new: true }
  //       );

  //       await gameIOEvents.makeGameMove(
  //         { io, socket },
  //         {
  //           gameId: curGame.id,
  //           movedDeck: genCards(['spade_1']),
  //         }
  //       );

  //       expect(socket.emit.calledOnce).to.be.true;
  //       expect(
  //         socket.emit.calledWithExactly(
  //           IOEvents.error,
  //           cardValMessages.gameNotStarted()
  //         )
  //       );
  //     });

  //     it('throws error', async () => {
  //       expect(socket.emit.called).to.be.false;

  //       let curGame = await gameService.createGame(socketId, username);
  //       curGame = await Game.findByIdAndUpdate(
  //         curGame.id,
  //         {
  //           $set: { currentSuite: 'club', currentValue: '2' },
  //         },
  //         { new: true }
  //       );

  //       await gameIOEvents.makeGameMove(
  //         { io, socket },
  //         {
  //           gameId: curGame.id,
  //           movedDeck: genCards(['spade_1']),
  //         }
  //       );

  //       expect(socket.emit.calledOnce).to.be.true;
  //       expect(
  //         socket.emit.calledWithExactly(
  //           cardEvents.cardError,
  //           cardValMessages.singleMismatch()
  //         )
  //       );
  //     });
  //   });

  //   describe('makeMove command moves', async () => {
  //     const socketId = 'sock-id',
  //       socketId2 = 'sock-id-2',
  //       socketId3 = 'sock-id-3',
  //       socketId4 = 'sock-id-4';
  //     const username = 'titan',
  //       username2 = 'eren',
  //       username3 = 'mikassa',
  //       username4 = 'jean';
  //     let curGame;
  //     3;

  //     beforeEach(async () => {
  //       curGame = await gameService.createGame(socketId, username);
  //       await gameService.joinGame(curGame.id, {
  //         socketId: socketId2,
  //         username: username2,
  //       });
  //       await gameService.joinGame(curGame.id, {
  //         socketId: socketId3,
  //         username: username3,
  //       });
  //       await gameService.joinGame(curGame.id, {
  //         socketId: socketId4,
  //         username: username4,
  //       });
  //       curGame = await Game.findByIdAndUpdate(curGame.id, {
  //         $set: {
  //           currentSuite: 'club',
  //           currentValue: '1',
  //           gameStatus: 'STARTED',
  //         },
  //       });
  //     });

  //     describe('onRestMove', () => {
  //       it('makes move single', async () => {
  //         expect(io.in.called).to.be.false;

  //         await Game.findByIdAndUpdate(
  //           curGame.id,
  //           {
  //             $set: { currentSuite: 'spade', currentValue: 2 },
  //           },
  //           { new: true }
  //         );

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           {
  //             gameId: curGame.id,
  //             movedDeck: genCards(['spade_3']),
  //             asSuite: 'spade',
  //           }
  //         );

  //         curGame = await Game.findById(curGame.id);

  //         expect(curGame.currentSuite).to.equal('spade');
  //         expect(curGame.currentValue).to.equal('3');
  //         expect(curGame.topCard.value).to.equal('3');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId2);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWith(curGame.id)).to.be.true;
  //         expect(io.in().emit.calledOnce).to.be.true;
  //         expect(io.in().emit.calledWith(playerEvents.playerCurrent, socketId2));

  //         expect(finalizeStub.calledOnce).to.be.true;
  //       });

  //       // TODO: Optional add test for multi cards
  //     });

  //     describe('onSuiteChanger', () => {
  //       it('changes current suite', async () => {
  //         expect(io.in.called).to.be.false;

  //         await Game.findByIdAndUpdate(
  //           curGame.id,
  //           {
  //             $set: { currentSuite: 'heart', direction: -1 },
  //           },
  //           { new: true }
  //         );

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           {
  //             gameId: curGame.id,
  //             movedDeck: genCards(['heart_8']),
  //             asSuite: 'spade',
  //           }
  //         );

  //         curGame = await Game.findById(curGame.id);

  //         expect(curGame.currentSuite).to.equal('spade');
  //         expect(curGame.currentValue).to.equal('8');
  //         expect(curGame.topCard.value).to.equal('8');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId4);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWith(curGame.id)).to.be.true;
  //         expect(io.in().emit.calledOnce).to.be.true;
  //         expect(io.in().emit.calledWith(playerEvents.playerCurrent, socketId4));
  //       });
  //     });

  //     describe('onAce', () => {
  //       it('deals next player', async () => {
  //         expect(io.in.called).to.be.false;

  //         const { players } = curGame;
  //         players[0].cards = genCards(['club_1', 'club_2']);
  //         players[2].cards = genCards(['club_3']);

  //         await Game.findByIdAndUpdate(
  //           curGame.id,
  //           {
  //             $set: {
  //               players,
  //               currentSuite: 'heart',
  //               lastDealtCards: genCards(['club_1']),
  //             },
  //           },
  //           { new: true }
  //         );

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           {
  //             gameId: curGame.id,
  //             movedDeck: genCards(['heart_1']),
  //           }
  //         );

  //         curGame = await Game.findById(curGame.id);

  //         expect(curGame.currentSuite).to.equal('heart');
  //         expect(curGame.currentValue).to.equal('1');
  //         expect(curGame.topCard.value).to.equal('1');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId2);
  //         expect(curGame.players[1].cards.length).to.equal(2);
  //         expect(curGame.deck.length).to.equal(53);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWith(curGame.id)).to.be.true;
  //         expect(io.in().emit.calledOnce).to.be.true;
  //         expect(io.in().emit.calledWith(playerEvents.playerCurrent, socketId2))
  //           .to.be.true;
  //       });
  //     });

  //     describe('onSkipper', () => {
  //       it('skips player', async () => {
  //         expect(io.in.called).to.be.false;
  //         expect(io.to.called).to.be.false;

  //         const { players } = curGame;
  //         players[0].cards = genCards(['club_1', 'club_2']);
  //         players[2].cards = genCards(['club_3']);

  //         await Game.findByIdAndUpdate(
  //           curGame.id,
  //           {
  //             $set: {
  //               players,
  //               currentSuite: 'heart',
  //               lastDealtCards: genCards(['club_1']),
  //             },
  //           },
  //           { new: true }
  //         );

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: genCards(['heart_5']) }
  //         );

  //         curGame = await Game.findById(curGame.id);

  //         expect(curGame.currentSuite).to.equal('heart');
  //         expect(curGame.currentValue).to.equal('5');
  //         expect(curGame.topCard.value).to.equal('5');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId3);
  //         expect(curGame.players[0].cards.length).to.equal(1);
  //         expect(curGame.players[2].cards.length).to.equal(2);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWithExactly(curGame.id)).to.be.true;
  //         expect(io.in().emit.called).to.be.true;
  //         expect(
  //           io.in().emit.calledWithExactly(playerEvents.playerCurrent, socketId3)
  //         ).to.be.true;
  //         expect(io.to.calledTwice).to.be.true;
  //         expect(io.to().emit.calledTwice).to.be.true;
  //         expect(io.to.calledWith(socketId3)).to.be.true;
  //       });
  //     });

  //     describe('onDirectionChanger', () => {
  //       it('changes direction', async () => {
  //         expect(io.in.called).to.be.false;

  //         await Game.findByIdAndUpdate(curGame.id, {
  //           $set: { currentSuite: 'spade' },
  //         });
  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: genCards(['spade_7']) }
  //         );

  //         curGame = await Game.findById(curGame.id);

  //         expect(curGame.direction).to.equal(-1);
  //         expect(curGame.topCard.value).to.equal('7');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId4);
  //         expect(curGame.currentSuite).to.equal('spade');
  //         expect(curGame.currentValue).to.equal('7');
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWithExactly(curGame.id)).to.be.true;
  //         expect(io.in().emit.called).to.be.true;
  //         expect(
  //           io.in().emit.calledWithExactly(playerEvents.playerCurrent, socketId4)
  //         ).to.be.true;
  //       });
  //     });

  //     describe('onJoker', () => {
  //       it('deals next player cards', async () => {
  //         expect(io.in.called).to.be.false;
  //         expect(socket.emit.called).to.be.false;
  //         await Game.findByIdAndUpdate(curGame.id, {
  //           $set: {
  //             direction: -1,
  //             firstMovePlayed: true,
  //             currentPlayerHasDrawnCard: true,
  //           },
  //         });

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: genCards(['joker_1']) }
  //         );

  //         curGame = await Game.findById(curGame.id);
  //         expect(curGame.currentSuite).to.equal('joker');
  //         expect(curGame.topCard.suite).to.equal('joker');
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId4);
  //         expect(curGame.players[3].cards.length).to.equal(10);
  //         expect(curGame.deck.length).to.equal(45);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWith(curGame.id)).to.be.true;
  //         expect(io.in().emit.called).to.be.true;
  //         expect(
  //           io
  //             .in(curGame.id)
  //             .emit.calledWithExactly(playerEvents.playerCurrent, socketId4)
  //         ).to.be.true;
  //         expect(socket.emit.called).to.be.true;
  //         expect(
  //           socket.emit.calledWithExactly(
  //             playerEvents.playerCards,
  //             curGame.players[2].cards
  //           )
  //         );
  //       });
  //     });

  //     describe('emptyDeck', () => {
  //       it('moves to next player', async () => {
  //         expect(io.in.called).to.be.false;
  //         await Game.findByIdAndUpdate(curGame.id, {
  //           $set: { firstMovePlayed: true, currentPlayerHasDrawnCard: true },
  //         });

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: [] }
  //         );

  //         curGame = await Game.findById(curGame.id);
  //         expect(curGame.currentPlayerSocketId).to.equal(socketId2);
  //         expect(io.in.called).to.be.true;
  //         expect(io.in.calledWithExactly(curGame.id)).to.be.true;
  //         expect(io.in().emit.called).to.be.true;
  //         expect(io.in().emit.calledWith(playerEvents.playerCurrent, socketId2))
  //           .to.be.true;
  //       });

  //       it('emits error if no cards drawn', async () => {
  //         expect(socket.emit.called).to.be.false;
  //         await Game.findByIdAndUpdate(curGame.id, {
  //           $set: { firstMovePlayed: true },
  //         });

  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: [] }
  //         );

  //         expect(socket.emit.calledOnce).to.be.true;
  //         expect(
  //           socket.emit.calledWithExactly(
  //             cardEvents.cardPlayFail,
  //             'Draw a card from deck or play hand'
  //           )
  //         );
  //       });

  //       it('emits error if no first move', async () => {
  //         expect(socket.emit.called).to.be.false;
  //         await gameIOEvents.makeGameMove(
  //           { io, socket },
  //           { gameId: curGame.id, socketId, movedDeck: [] }
  //         );
  //         expect(socket.emit.calledOnce).to.be.true;
  //         expect(
  //           socket.emit.calledWithExactly(
  //             cardEvents.cardPlayFail,
  //             "Can't have empty deck on first move"
  //           )
  //         );
  //       });
  //     });
  //   });

  //   describe('startGame', () => {
  //     it("doesn't start game if only on player", async () => {
  //       const socketId = 'sock-id';
  //       const username = 'titan';
  //       const newGame = await gameService.createGame(socketId, username);
  //       await Game.findByIdAndUpdate(newGame.id, {
  //         $set: { gameStatus: 'PENDING' },
  //       });

  //       expect(socket.emit.called).to.be.false;

  //       await gameIOEvents.startGameRoom(
  //         { io, socket },
  //         { socketId, gameId: newGame.id }
  //       );

  //       expect(socket.emit.called).to.be.true;
  //       expect(
  //         socket.emit.calledWith(IOEvents.error, {
  //           message: 'Must have more than 1 player to start game',
  //         })
  //       ).to.be.true;
  //     });

  //     it('emits error if already started', async () => {
  //       const socketId = 'sock-id';
  //       const username = 'titan';
  //       const newGame = await gameService.createGame(socketId, username);
  //       await Game.findByIdAndUpdate(newGame.id, {
  //         $set: { gameStatus: 'STARTED' },
  //       });

  //       expect(socket.emit.called).to.be.false;

  //       await gameIOEvents.startGameRoom(
  //         { io, socket },
  //         { socketId, gameId: newGame.id }
  //       );

  //       expect(socket.emit.called).to.be.true;
  //       expect(
  //         socket.emit.calledWith(IOEvents.error, {
  //           message: 'Game already started',
  //         })
  //       ).to.be.true;
  //     });

  //     it("emits error if user didn't start game", async () => {
  //       const socketId = 'sock-id';
  //       const username = 'titan';
  //       const newGame = await gameService.createGame(socketId, username);

  //       expect(socket.emit.called).to.be.false;

  //       await gameIOEvents.startGameRoom(
  //         { io, socket },
  //         { socketId: 's', gameId: newGame.id }
  //       );

  //       expect(socket.emit.called).to.be.true;
  //       expect(
  //         socket.emit.calledWith(IOEvents.error, {
  //           message: 'Unauthorized to start game',
  //         })
  //       ).to.be.true;
  //     });

  //     it('starts game', async () => {
  //       const socketId = 'sock-id';
  //       const username = 'titan';
  //       const newGame = await gameService.createGame(socketId, username);
  //       await gameService.joinGame(newGame.id, {
  //         socketId: 'sock-id-2',
  //         username: 'eren',
  //       });

  //       expect(socket.emit.called).to.be.false;
  //       expect(io.in.called).to.be.false;

  //       await gameIOEvents.startGameRoom(
  //         { io, socket },
  //         { socketId, gameId: newGame.id }
  //       );

  //       // TODO: Retest
  //       const gameDb = (await Game.findById(newGame.id)).toJSON();
  //       expect(io.in.calledOnce).to.be.true;
  //       expect(io.in.calledWithExactly(newGame.id)).to.be.true;
  //       expect(io.in(newGame.id).emit.calledOnce).to.be.true;
  //       // Failing deep assertion
  //       expect(
  //         io.in(newGame.id).emit.calledWith(gameIOEvents.gameEvents.startedGame, {
  //           currentPlayerSocketId: newGame.currentPlayerSocketId,
  //           players: gameDb.players,
  //         })
  //       ).to.be.true;
  //       expect(socket.emit.calledTwice).to.be.true;
  //       expect(
  //         socket.emit
  //           .getCall(0)
  //           .calledWith(playerEvents.playerCards, gameDb.players[0].cards)
  //       ).to.be.true;
  //       expect(
  //         socket.emit
  //           .getCall(1)
  //           .calledWith(playerEvents.playerCards, gameDb.players[1].cards)
  //       ).to.be.true;
  //     });
  //   });
});
