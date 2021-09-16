import { expect } from 'chai';
import sinon from 'sinon';
import { cardEvents } from '../../src/modules/card/card.events';
import { finalizeMove } from '../../src/modules/game/finalizeEvent';
import { gameEvents } from '../../src/modules/game/game.events';
import Game from '../../src/modules/game/game.model';
import * as gameService from '../../src/modules/game/game.service';
import { stubSocketIO, clearDb, genCards } from '../testUtils';

const sandbox = sinon.createSandbox();
let io;

describe('finalizeEvent', () => {
  beforeEach(async () => {
    io = stubSocketIO(sandbox);
    await clearDb();
  });

  describe('finalize', () => {
    const socketId = 'sock-id',
      socketId2 = 'sock-id-2';
    const username = 'titan',
      username2 = 'eren';

    let curGame;

    beforeEach(async () => {
      curGame = await gameService.createGame(socketId, username);
      await gameService.joinGame(curGame.id, {
        socketId: socketId2,
        username: username2,
      });
      curGame = await Game.findByIdAndUpdate(curGame.id, {
        $set: { currentSuite: 'club', currentValue: '1' },
      });
    });

    it('emits card:left', async () => {
      const { players } = curGame;
      players[0].cards = genCards(['club_1']);
      await Game.findByIdAndUpdate(curGame.id, {
        $set: { players },
      });
      expect(io.to.called).to.be.false;

      await finalizeMove({ io, cardPlayerSocketId: socketId }, curGame);
      curGame = await Game.findById(curGame.id);

      expect(io.in.called).to.be.true;
      expect(io.in.calledWith(curGame.id)).to.be.true;
      // Emits game finished
      expect(io.in().emit.called).to.be.true;
      expect(
        io
          .in()
          .emit.calledWith(cardEvents.cardLeft, curGame.players[0].username),
      );
    });

    it('emits game finish', async () => {
      const { players } = curGame;
      players[0].cards = [];
      await Game.findByIdAndUpdate(curGame.id, {
        $set: { players },
      });
      expect(io.to.called).to.be.false;

      await finalizeMove({ io, cardPlayerSocketId: socketId }, curGame);
      curGame = await Game.findById(curGame.id);

      expect(curGame.gameStatus).to.equal('FINISHED');
      expect(io.in.called).to.be.true;
      expect(io.in.calledWith(curGame.id)).to.be.true;
      // Emits game finished
      expect(io.in().emit.called).to.be.true;
      expect(
        io.in().emit.calledWith(gameEvents.finishedGame, {
          winner: username,
        }),
      );
    });
  });
});
