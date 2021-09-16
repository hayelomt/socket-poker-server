import sinon from 'sinon';

import * as cardUtils from '../../src/modules/card/cardUtils';
import { clearDb, genCards } from '../testUtils';
import Game from '../../src/modules/game/game.model';
import { expect } from 'chai';
import {
  createGame,
  usernameTaken,
  joinGame,
  dealPlayer,
  startGame,
  generateTag,
} from '../../src/modules/game/game.service';
import * as gameService from '../../src/modules/game/game.service';
import { GameStatus, IPlayer } from '../../src/modules/game/game.interfaces';

const sandbox = sinon.createSandbox();

describe('GameService', () => {
  const socketId = 'sock';
  const username = 'titanht';

  beforeEach(() => {
    sandbox.stub(cardUtils, 'shuffle').callsFake(i => i);
  });

  afterEach(async () => {
    await clearDb();
    sandbox.restore();
  });

  describe('diffArr', () => {
    it('differentiates', () => {
      expect(gameService.diffArray(['1', '2'], [])).to.deep.equal(['1', '2']);
      expect(gameService.diffArray(['1', '2'], ['2'])).to.deep.equal(['1']);
      expect(
        gameService.diffArray(['1', '2', '1', '3'], ['1', '2']),
      ).to.deep.equal(['1', '3']);
      expect(
        gameService.diffArray(['1', '2', '2', '1', '1', '3'], ['1', '1', '2']),
      ).to.deep.equal(['2', '1', '3']);
    });
  });

  describe('getPlayer', () => {
    it('returns player object', async () => {
      const players = [
        { username: 'u1', socketId: 's1', isStarter: true, cards: [] },
        { username: 'u2', socketId: 's2', isStarter: true, cards: [] },
        { username: 'u3', socketId: 's3', isStarter: true, cards: [] },
      ];

      const player = await gameService.getPlayer(players, 's2');

      expect(player).to.deep.equal({
        username: 'u2',
        socketId: 's2',
      });
    });
  });

  describe('finishGame', () => {
    it('marks game finished', async () => {
      const newGame = await createGame(socketId, username);

      await gameService.finishGame(newGame.id);
      const uGame = await Game.findById(newGame.id);

      expect(uGame.gameStatus).to.equal(GameStatus.Finished);
    });
  });

  describe('diffCards', async () => {
    it('differentiates cards', async () => {
      const cardSource = genCards([
        'club_1',
        'club_2',
        'club_jack',
        'heart_1',
        'spade_2',
      ]);
      const drawnCards = genCards(['club_2', 'club_jack', 'spade_2']);
      const assertCards = genCards(['club_1', 'heart_1']);

      expect(gameService.diffCards(cardSource, drawnCards)).to.deep.equal(
        assertCards,
      );
    });
  });

  describe('getNextPlayer', () => {
    it('getsNextPlayer', () => {
      const players = [
        { socketId: 's1', username: 'u1' },
        { socketId: 's2', username: 'u2' },
        { socketId: 's3', username: 'u3' },
        { socketId: 's4', username: 'u4' },
      ] as IPlayer[];

      let nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's1',
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's2', username: 'u2' },
        'next +1',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's2',
        direction: -1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's1', username: 'u1' },
        'next -1',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's1',
        direction: -1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's4', username: 'u4' },
        'next -1 wrap around',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's4',
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's1', username: 'u1' },
        'next +1 wrap around',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's1',
        skips: 1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's3', username: 'u3' },
        'next +1 skip 1',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's1',
        skips: 3,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's1', username: 'u1' },
        'next +1 skip 3',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's4',
        skips: 1,
        direction: -1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's2', username: 'u2' },
        'next -1 skip 1',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's2',
        skips: 1,
        direction: -1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's4', username: 'u4' },
        'next -1 skip 1',
      );

      nxtPlayer = gameService.getNextPlayer({
        players,
        currentPlayerSocketId: 's4',
        skips: 3,
        direction: -1,
      });
      expect(nxtPlayer).to.deep.equal(
        { socketId: 's4', username: 'u4' },
        'next -1 skip 1',
      );
    });
  });

  describe('usernameTaken', () => {
    it('returns true for existing false for non', async () => {
      let taken = await usernameTaken('6131f16c02db18356c62f346', username);
      expect(taken).to.be.false;

      const gameId = (await createGame(socketId, username)).id;

      taken = await usernameTaken(gameId, username);
      expect(taken).to.be.true;

      taken = await usernameTaken(gameId, 'username');
      expect(taken).to.be.false;
    });
  });

  describe('dealPlayer', () => {
    it('gives player card and removes from deck', async () => {
      const id = await createGame(socketId, username);

      await dealPlayer(id, socketId, 3);

      const uGame = await Game.findById(id);
      expect(uGame.deck.length).to.equal(52);
      expect(uGame.deck[0].identifier).to.equal('club_4');
      expect(uGame.players[0].cards.length).to.equal(3);
      expect(uGame.players[0].cards[0].identifier).to.equal('club_1');
    });
  });

  describe('startGame', () => {
    let gameId;
    beforeEach(async () => {
      gameId = await createGame(socketId, username);
      await joinGame(gameId, { socketId: 'sock-2', username: 'mikassa' });
    });

    it('changes game status to STARTED', async () => {
      await startGame(gameId);
      const uGame = await Game.findById(gameId);
      expect(uGame.gameStatus).to.equal('STARTED');
    });

    it('assigns player 1 handSize+1 p2 handSize cards', async () => {
      await startGame(gameId);
      const uGame = await Game.findById(gameId);

      expect(uGame.handSize).to.equal(3);
      expect(uGame.deck.length).to.equal(55 - 7);
      expect(uGame.players[0].cards.length).to.equal(3);
      expect(uGame.players[1].cards.length).to.equal(3);
      expect(uGame.currentPlayerSocketId).to.equal(socketId);
      expect(uGame.topCard).to.exist;
      expect(uGame.topCard.identifier).to.exist;
      expect(uGame.currentSuite).to.equal(uGame.topCard.suite);
      expect(uGame.currentValue).to.equal(uGame.topCard.value);
    });
  });

  describe('joinGame', () => {
    it('returns false for non/existent game', async () => {
      const joined = await joinGame('6131f16c02db18356c62f346', {
        socketId,
        username,
      });
      expect(joined).to.be.false;
    });

    it('adds player to game', async () => {
      const socketId2 = 'sock-2';
      const username2 = 'eren';

      const id = await createGame(socketId, username);

      await joinGame(id, { socketId: socketId2, username: username2 });

      const updatedGame = await Game.findById(id);
      expect(updatedGame.players.length).to.equal(2);
      expect(updatedGame.players[1].username).to.equal(username2);
    });
  });

  describe('generateTag', () => {
    it('generates unique tag', async () => {
      const tag = await generateTag();
      expect(tag.length).to.equal(5);
    });
  });

  describe('createGame', () => {
    it('creates game', async () => {
      let games = await Game.find();
      expect(games).to.deep.equal([]);
      const newGame = await createGame(socketId, username);
      games = await Game.find();
      expect(games.length).to.equal(1);
      const newGameDB = games[0].toJSON();
      expect(newGameDB._id.toString()).to.equal(newGame._id.toString());
      expect(newGame.deck.length).to.equal(55);
      expect(newGame.currentHand).to.deep.equal([]);
      expect(newGame.currentPlayerSocketId).to.equal(socketId);
    });
  });
});
