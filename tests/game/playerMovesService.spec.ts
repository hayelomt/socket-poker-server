import sinon from 'sinon';

import * as cardUtils from '../../src/modules/card/cardUtils';
import { clearDb, genCards } from '../testUtils';
import Game from '../../src/modules/game/game.model';
import { expect } from 'chai';
import playerMoves from '../../src/modules/game/playerMoves.service';
import { createGame, joinGame } from '../../src/modules/game/game.service';

const sandbox = sinon.createSandbox();

describe('GameService', () => {
  const socketId = 'sock-id',
    socketId2 = 'sock-id-2',
    socketId3 = 'sock-id-3';
  const username = 'titan',
    username2 = 'eren',
    username3 = 'mikassa';
  let curGame;

  beforeEach(() => {
    sandbox.stub(cardUtils, 'shuffle').callsFake(i => i);
  });

  afterEach(async () => {
    await clearDb();
    sandbox.restore();
  });

  describe('clearDealtCards', () => {
    it('clears dealt record', async () => {
      curGame = await createGame(socketId, username);
      curGame = await Game.findByIdAndUpdate(
        curGame.id,
        {
          $set: { lastDealtCards: genCards(['club_1']) },
        },
        { new: true },
      );

      await playerMoves.clearDealtCards(curGame);
      curGame = await Game.findById(curGame.id);

      expect(curGame.lastDealtCards.length).to.equal(0);
    });
  });

  describe('writePlayerMove', () => {
    it('removes cards from player card and returns to deck', async () => {
      curGame = await createGame(socketId, username);
      curGame = await playerMoves.dealCard(curGame, 3, socketId);
      const { cards } = curGame.players[0];

      await playerMoves.writePlayerMove(curGame, socketId, cards.slice(0, 2));
      curGame = await Game.findById(curGame.id);

      expect(curGame.players[0].cards.length).to.equal(1);
      expect(curGame.players[0].cards[0].identifier).to.equal(
        cards[2].identifier,
      );
      expect(curGame.deck.length).to.equal(54);
      expect(curGame.deck[53].identifier).to.equal(cards[1].identifier);
      expect(curGame.currentHand.length).to.equal(2);
    });
  });

  describe('moveToNextPlayer', () => {
    beforeEach(async () => {
      curGame = await createGame(socketId, username);
      await joinGame(curGame.id, {
        socketId: socketId2,
        username: username2,
      });
      await joinGame(curGame.id, {
        socketId: socketId3,
        username: username3,
      });
      await Game.findByIdAndUpdate(curGame.id, {
        $set: {
          currentPlayerHasDrawnCard: true,
          // currentHand: genCards(['club_1', 'club_2']),
          direction: -1,
        },
      });
      curGame = await Game.findById(curGame.id);
    });

    it('changes cur player socket Id', async () => {
      await playerMoves.moveToNextPlayer(curGame, {});
      curGame = await Game.findById(curGame.id);
      expect(curGame.currentPlayerSocketId).to.equal(socketId3);
    });

    it('currentPlayerHasDrawnCard to false', async () => {
      await playerMoves.moveToNextPlayer(curGame, {});
      curGame = await Game.findById(curGame.id);
      expect(curGame.currentPlayerHasDrawnCard).to.be.false;
    });
  });

  describe('setTopCard', () => {
    it('sets top card', async () => {
      curGame = await createGame(socketId, username);
      const card = genCards(['club_8']);

      await playerMoves.setTopCard(curGame, card[0]);
      curGame = await Game.findById(curGame.id);
      const { topCard } = curGame.toJSON();

      expect(curGame.topCard).to.exist;
      delete topCard._id;
      expect(topCard).to.deep.equal(card[0]);
    });
  });

  describe('setCurrentSuite', () => {
    it('sets suite', async () => {
      let curGame = await createGame(socketId, username);

      await playerMoves.setCurrentSuite(curGame, 'diamond');
      curGame = await Game.findById(curGame.id);

      expect(curGame.currentSuite).to.equal('diamond');
    });
  });

  describe('setCurrentValue', () => {
    it('setsValue', async () => {
      let curGame = await createGame(socketId, username);

      await playerMoves.setCurrentValue(curGame, '10');
      curGame = await Game.findById(curGame.id);

      expect(curGame.currentValue).to.equal('10');
    });
  });

  describe('changeCurrentPlayer', () => {
    it('changes player', async () => {
      let curGame = await createGame(socketId, username);

      await playerMoves.changeCurrentPlayer(curGame, socketId2);

      curGame = await Game.findById(curGame.id);
      expect(curGame.currentPlayerSocketId).to.equal(socketId2);
    });
  });

  describe('updateCurrentHand', () => {
    it('updates hand and moves old hand to deck', async () => {
      let curGame = await createGame(socketId, username);
      await Game.findByIdAndUpdate(curGame.id, {
        $set: { currentHand: genCards(['club_1', 'diamond_1']) },
      });

      curGame = await Game.findById(curGame.id);
      await playerMoves.updateCurrentHand(curGame, genCards(['joker_1']));

      curGame = await Game.findById(curGame.id);
      expect(curGame.deck.length).to.equal(57);
      expect(curGame.currentHand.length).to.equal(1);
    });
  });

  describe('transferDealtCards', () => {
    it('transfers cards', async () => {
      curGame = await createGame(socketId, username);
      await joinGame(curGame.id, {
        socketId: socketId2,
        username: username2,
      });
      curGame = await Game.findById(curGame.id);
      const players = curGame.players;
      players[0].cards = genCards(['club_1', 'club_2', 'club_3']);
      players[1].cards = genCards(['spade_4', 'spade_5']);
      curGame = await Game.findByIdAndUpdate(
        curGame.id,
        {
          $set: {
            players,
            lastDealtCards: genCards(['club_1', 'club_2']),
          },
        },
        { new: true },
      );

      await playerMoves.transferDealtCard(curGame, socketId, socketId2);

      curGame = await Game.findById(curGame.id);

      expect(curGame.players[0].cards.length).to.equal(1);
      expect(curGame.players[0].cards[0].identifier).to.equal('club_3');
      expect(curGame.players[1].cards.length).to.equal(4);
      expect(curGame.players[1].cards[0].identifier).to.equal('club_1');
    });
  });

  describe('dealCards', () => {
    it('deals player card and decreases from deck', async () => {
      let curGame = await createGame(socketId, username);
      const starterDeck = curGame.deck;
      await joinGame(curGame.id, {
        socketId: socketId2,
        username: username2,
      });
      curGame = await Game.findById(curGame.id);

      await playerMoves.dealCard(curGame, 5, socketId2);

      curGame = await Game.findById(curGame.id);
      expect(curGame.deck.length).to.equal(55 - 5);
      expect(curGame.players[0].cards.length).to.equal(0);
      expect(curGame.players[1].cards.length).to.equal(5);
      expect(curGame.players[1].cards[0].toJSON()).to.deep.equal(
        starterDeck[0].toJSON(),
      );
      expect(curGame.lastDealtCards.length).to.equal(5);

      await playerMoves.dealCard(curGame, 1, socketId2);

      curGame = await Game.findById(curGame.id);
      expect(curGame.deck.length).to.equal(49);
      expect(curGame.players[1].cards.length).to.equal(6);
      expect(curGame.lastDealtCards.length).to.equal(1);

      await playerMoves.dealCard(curGame, 1, socketId);

      curGame = await Game.findById(curGame.id);
      expect(curGame.deck.length).to.equal(48);
      expect(curGame.players[0].cards.length).to.equal(1);
      expect(curGame.players[1].cards.length).to.equal(6);
      expect(curGame.lastDealtCards.length).to.equal(1);
    });
  });

  describe('changeDirection', () => {
    it('changes direction', async () => {
      let curGame = await createGame('sock', 'titan');
      expect(curGame.direction).to.equal(1);

      await playerMoves.changeDirection(curGame);

      curGame = await Game.findById(curGame.id);
      expect(curGame.direction).to.equal(-1);

      await playerMoves.changeDirection(curGame);

      curGame = await Game.findById(curGame.id);
      expect(curGame.direction).to.equal(1);
    });
  });
});

// describe('updatePlayerCards,', () => {
//   it('updates a players card', async () => {
//     let curGame = await createGame('s1', 'u1');
//     await joinGame(curGame.id, { socketId: 's1', username: 'u1' });
//     curGame = await Game.findById(curGame.id);
//     const { players } = curGame;
//     players[0].cards = genCards(['club_1', 'club_2']);
//     players[1].cards = genCards(['club_1', 'club_2', 'diamond_1']);
//     await Game.findByIdAndUpdate(curGame.id, {
//       players,
//     });
//     curGame = await Game.findById(curGame.id);

//     await playerMoves.updatePlayerCards(
//       curGame,
//       1,
//       genCards(['club_1', 'diamond_1']),
//     );
//     curGame = await Game.findById(curGame.id);

//     expect(curGame.players[0].cards.length).to.equal(2);
//     expect(curGame.players[1].cards.length).to.equal(1);
//     expect(curGame.players[1].cards[0].identifier).to.equal('club_2');
//   });
// });
