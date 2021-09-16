import { ICard } from '../game/game.interfaces';

export const shuffle = (deck: ICard[]) => {
  const tempDeck = [...deck];
  // TODO: UnComment
  // const deckLength = tempDeck.length;
  // for (let i = 0; i < deckLength; i++) {
  //   const randomIndex = Math.floor(Math.random() * deckLength);
  //   const temp = tempDeck[i];
  //   tempDeck[i] = tempDeck[randomIndex];
  //   tempDeck[randomIndex] = temp;
  // }

  return tempDeck;
};

export const errorCodes = {
  mismatch: 'card_mismatch',
  missing_7: 'missing_7',
  single_mismatch: 'single_mismatch',
  multi_suite_mismatch: 'multi_suite_mismatch',
  multi_first_move: 'multi_first_move',
  game_not_started: 'game_not_started',
  one_player_only: 'on_player_only',
};

export const cardValMessages = {
  mismatchedSuites() {
    return {
      message: 'Mismatching suites in drawn cards',
      code: errorCodes.mismatch,
    };
  },
  missing7() {
    return {
      message: 'Multiple cards drawn missing 7',
      code: errorCodes.missing_7,
    };
  },
  multiGameNotStarted() {
    return {
      message: 'Can only draw single card on first move',
      code: errorCodes.multi_first_move,
    };
  },
  singleMismatch() {
    return {
      message: "Card doesn't match suite or value",
      code: errorCodes.single_mismatch,
    };
  },
  multiSuiteMismatch() {
    return {
      message: "Some card don't match current suite",
      code: errorCodes.multi_suite_mismatch,
    };
  },
  gameNotStarted(gameStatus) {
    return {
      message: `Game not on play, status:${gameStatus}`,
      code: errorCodes.game_not_started,
    };
  },
  onePlayerOnly() {
    return {
      message: 'Must have more than one player to start game',
      code: errorCodes.one_player_only,
    };
  },
};
