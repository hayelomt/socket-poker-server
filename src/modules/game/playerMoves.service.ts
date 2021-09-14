import { ICard, IGame } from './game.interfaces';
import Game from './game.model';
import { diffCards, getNextPlayer } from './game.service';

const playerMoves = {
  async writePlayerMove(game: IGame, playerSocketId: string, cards: ICard[]) {
    const playerIndex = game.players.findIndex(
      player => player.socketId === playerSocketId,
    );
    const { players } = game;
    let { deck, currentHand } = game;

    if (playerIndex !== -1) {
      const newCards = diffCards(game.players[playerIndex].cards, cards);
      players[playerIndex].cards = newCards;
      // TODO: Add shuffle
      deck = [...deck, ...cards];
      currentHand = cards;
    }

    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: { players, deck, currentHand },
      },
      { new: true },
    );
  },
  async moveToNextPlayer(game: IGame, { skips = 0 }) {
    const nextPlayer = getNextPlayer({
      players: game.players,
      currentPlayerSocketId: game.currentPlayerSocketId,
      direction: game.direction,
      skips,
    });
    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: {
          currentPlayerHasDrawnCard: false,
          currentPlayerSocketId: nextPlayer.socketId,
        },
      },
      { new: true },
    );
  },
  async setFirstMovePlayed(game: IGame) {
    return Game.findByIdAndUpdate(
      game.id,
      { $set: { firstMovePlayed: true } },
      {
        new: true,
      },
    );
  },
  async setTopCard(game: IGame, card: ICard) {
    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: { topCard: card },
      },
      { new: true },
    );
  },
  async setCurrentSuite(game: IGame, newSuite: string) {
    return Game.findByIdAndUpdate(
      game.id,
      { $set: { currentSuite: newSuite } },
      { new: true },
    );
  },
  async setCurrentValue(game: IGame, newValue: string) {
    return Game.findByIdAndUpdate(
      game.id,
      { $set: { currentValue: newValue } },
      { new: true },
    );
  },
  async changeCurrentPlayer(game: IGame, newPlayerSocketId: string) {
    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: { currentPlayerSocketId: newPlayerSocketId },
      },
      { new: true },
    );
  },
  async updateCurrentHand(game: IGame, newHand: ICard[]) {
    const updatedDeck = [...game.deck, ...game.currentHand];
    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: {
          deck: updatedDeck,
          currentHand: newHand,
        },
      },
      { new: true },
    );
  },
  async transferDealtCard(
    game: IGame,
    fromPlayerSocketId: string,
    toPlayerSocketId: string,
  ) {
    const { players } = game;
    const cardsCount = game.lastDealtCards.length;
    const player1Index = players.findIndex(
      player => player.socketId === fromPlayerSocketId,
    );
    const player2Index = players.findIndex(
      player => player.socketId === toPlayerSocketId,
    );
    if (cardsCount && player1Index !== -1 && player2Index !== -1) {
      players[player1Index].cards =
        players[player1Index].cards.slice(cardsCount);
      players[player2Index].cards = [
        ...game.lastDealtCards,
        ...players[player2Index].cards,
      ];
    }

    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: {
          players,
        },
      },
      { new: true },
    );
  },
  async dealCard(game: IGame, cardCount: number, playerSocketId: string) {
    const playerIndex = game.players.findIndex(
      i => i.socketId === playerSocketId,
    );

    if (playerIndex !== -1) {
      const updatedDeck = game.deck.slice(cardCount);
      const lastDealtCards = game.deck.slice(0, cardCount);
      const updatedPlayers = [...game.players];
      updatedPlayers[playerIndex].cards = [
        ...game.deck.slice(0, cardCount),
        ...updatedPlayers[playerIndex].cards,
      ];

      return Game.findByIdAndUpdate(
        game.id,
        {
          $set: {
            deck: updatedDeck,
            players: updatedPlayers,
            lastDealtCards,
          },
        },
        { new: true },
      );
    }
  },
  async changeDirection(game: IGame) {
    return Game.findByIdAndUpdate(
      game.id,
      {
        $set: { direction: game.direction === 1 ? -1 : 1 },
      },
      { new: true },
    );
  },
};

export default playerMoves;
