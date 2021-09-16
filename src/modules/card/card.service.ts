import { titleCase } from '../../utils/stringUtils';
import * as cardUtils from './cardUtils';
import {
  pokerCardValues,
  PokerIdentifers,
  PokerIdentifierValues,
  PokerSuite,
  PokerValue,
  pokerSuiteValues,
  suiteChangerCards,
  directionChangerCard,
  skipperCard,
} from './cardTypes';
import { ICard } from '../game/game.interfaces';

export const deckStats = {
  isSuiteChanger(deck: ICard[]) {
    return deck.length === 1 && suiteChangerCards.includes(deck[0].value);
  },
  isAce(deck: ICard[]) {
    return (
      deck.length === 1 &&
      deck[0].value == '1' &&
      deck[0].suite !== pokerSuiteValues.joker
    );
  },
  isSkipper(deck: ICard[]) {
    return deck.length === 1 && deck[0].value == skipperCard;
  },
  isDirectionChanger(deck: ICard[]) {
    return deck.length === 1 && deck[0].value == directionChangerCard;
  },
  isJoker(deck: ICard[]) {
    return deck.length === 1 && deck[0].suite === pokerSuiteValues.joker;
  },
  isEmpty(deck: ICard[]) {
    return !deck || deck.length === 0;
  },
};

export const cardRules = {
  validateMultiHas7(
    _currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    const indexOf7 = drawnCards.findIndex(
      item => item.value === pokerCardValues['7'],
    );

    if (indexOf7 !== -1) {
      return [false, null];
    }

    return [false, cardUtils.cardValMessages.missing7()];
  },
  validateMultiSameWithCurrentSuite(
    currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    if (currentSuite === pokerSuiteValues.joker) {
      return [false, null];
    }
    if (currentSuite === drawnCards[0].suite) {
      return [false, null];
    }

    return [false, cardUtils.cardValMessages.multiSuiteMismatch()];
  },
  validateMultiSameSuites(
    _currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    const suites = drawnCards.map(item => item.suite);
    if (Array.from(new Set(suites)).length > 1) {
      return [false, cardUtils.cardValMessages.mismatchedSuites()];
    }

    return [false, null];
  },
  validateSingleSameWithCurrentSuiteOrValue(
    currentSuite: string,
    currentValue: string,
    drawnCards: ICard[],
  ) {
    if (drawnCards.length === 1) {
      if (currentSuite === pokerSuiteValues.joker || !currentSuite) {
        return [true, null];
      }
      if (
        drawnCards[0].suite === currentSuite ||
        drawnCards[0].value === currentValue
      ) {
        return [true, null];
      } else {
        return [false, cardUtils.cardValMessages.singleMismatch()];
      }
    }
    return [false, null];
  },
  validateEight(
    _currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    if (
      drawnCards.length === 1 &&
      drawnCards[0].value === pokerCardValues['8']
    ) {
      return [true, null];
    }
    return [false, null];
  },
  validateJoker(
    _currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    if (
      drawnCards.length === 1 &&
      drawnCards[0].suite === pokerSuiteValues.joker
    ) {
      return [true, null];
    }
    return [false, null];
  },
  validateEmpty(
    _currentSuite: string,
    _currentValue: string,
    drawnCards: ICard[],
  ) {
    if (!drawnCards.length) {
      return [true, null];
    }
    return [false, null];
  },
};

export const cardRulesOrder = [
  'validateEmpty',
  'validateJoker',
  'validateEight',
  'validateSingleSameWithCurrentSuiteOrValue',
  'validateMultiSameSuites',
  'validateMultiSameWithCurrentSuite',
  'validateMultiHas7',
];

export const validateCardDraw = (
  currentSuite: string,
  currentValue: string,
  drawnCards: ICard[],
) => {
  for (let i = 0; i < cardRulesOrder.length; i++) {
    const curRule = cardRulesOrder[i];
    const [stopVal, err] = cardRules[curRule](
      currentSuite,
      currentValue,
      drawnCards,
    );
    if (stopVal === true) {
      break;
    }
    if (err !== null) {
      return [false, err];
    }
  }

  return [true, null];
};

export const generateDeck = () =>
  cardUtils.shuffle(
    PokerIdentifierValues.map(identifier => {
      const [suite, value] = identifier.split('_');

      return {
        identifier: identifier as PokerIdentifers,
        suite: suite as PokerSuite,
        value: value as PokerValue,
        title: `${titleCase(value)} of ${titleCase(suite)}`,
      };
    }),
  );
