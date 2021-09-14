import { titleCase } from '../../utils/stringUtils';
import * as cardUtils from './cardUtils';
import {
  PokerIdentifers,
  PokerIdentifierValues,
  PokerSuite,
  PokerValue,
} from './cardTypes';
// const cardUtils = require('./cardUtils');
// const { titleCase } = require('../../utils/stringUtils');
// const {
//   CARD_IDENTIFIERS,
//   cardSuites,
//   cardValues,
//   suiteChangerCards,
//   directionChangerCard: directionChanger,
//   skipperCard,
// } = require('./card');

// export const deckStats = {
//   isSuiteChanger(deck) {
//     return deck.length === 1 && suiteChangerCards.includes(deck[0].value);
//   },
//   isAce(deck) {
//     return (
//       deck.length === 1 &&
//       deck[0].value == '1' &&
//       deck.suite !== cardSuites.joker
//     );
//   },
//   isSkipper(deck) {
//     return deck.length === 1 && deck[0].value == skipperCard;
//   },
//   isDirectionChanger(deck) {
//     return deck.length === 1 && deck[0].value == directionChanger;
//   },
//   isJoker(deck) {
//     return deck.length === 1 && deck[0].suite === cardSuites.joker;
//   },
//   isEmpty(deck) {
//     return !deck || deck.length === 0;
//   },
// };

// export const cardRules = {
//   validateMultiHas7(_currentSuite, _currentValue, drawnCards) {
//     const indexOf7 = drawnCards.findIndex(
//       (item) => item.value === cardValues['7']
//     );
//     if (indexOf7 !== -1) {
//       return [false, null];
//     }

//     return [false, cardUtils.cardValMessages.missing7()];
//   },
//   validateMultiSameWithCurrentSuite(currentSuite, _currentValue, drawnCards) {
//     if (currentSuite === cardSuites.joker) {
//       return [false, null];
//     }
//     if (currentSuite === drawnCards[0].suite) {
//       return [false, null];
//     }

//     return [false, cardUtils.cardValMessages.multiSuiteMismatch()];
//   },
//   validateMultiSameSuites(_currentSuite, _currentValue, drawnCards) {
//     const suites = drawnCards.map((item) => item.suite);
//     if (Array.from(new Set(suites)).length > 1) {
//       return [false, cardUtils.cardValMessages.mismatchedSuites()];
//     }

//     return [false, null];
//   },
//   validateMultiFirstMovePlayed(currentSuite, _currentValue, drawnCards) {
//     if (!currentSuite) {
//       return [false, cardUtils.cardValMessages.multiGameNotStarted()];
//     }

//     return [false, null];
//   },
//   validateSingleSameWithCurrentSuiteOrValue(
//     currentSuite,
//     currentValue,
//     drawnCards
//   ) {
//     if (currentSuite === cardSuites.joker || !currentSuite) {
//       return [true, null];
//     }
//     if (drawnCards.length === 1) {
//       if (
//         drawnCards[0].suite === currentSuite ||
//         drawnCards[0].value === currentValue
//       ) {
//         return [true, null];
//       } else {
//         return [false, cardUtils.cardValMessages.singleMismatch()];
//       }
//     }
//     return [false, null];
//   },
//   validateEight(_currentSuite, _currentValue, drawnCards) {
//     if (drawnCards.length === 1 && drawnCards[0].value === cardValues['8']) {
//       return [true, null];
//     }
//     return [false, null];
//   },
//   validateJoker(_currentSuite, _currentValue, drawnCards) {
//     if (drawnCards.length === 1 && drawnCards[0].suite === cardSuites.joker) {
//       return [true, null];
//     }
//     return [false, null];
//   },
//   validateEmpty(_currentSuite, _currentValue, drawnCards) {
//     if (!drawnCards.length) {
//       return [true, null];
//     }
//     return [false, null];
//   },
// };

// export const cardRulesOrder = [
//   'validateEmpty',
//   'validateJoker',
//   'validateEight',
//   'validateSingleSameWithCurrentSuiteOrValue',
//   'validateMultiFirstMovePlayed',
//   'validateMultiSameSuites',
//   'validateMultiSameWithCurrentSuite',
//   'validateMultiHas7',
// ];

// export const validateCardDraw = (currentSuite, currentValue, drawnCards) => {
//   for (let i = 0; i < this.cardRulesOrder.length; i++) {
//     const curRule = this.cardRulesOrder[i];
//     const [stopVal, err] = this.cardRules[curRule](
//       currentSuite,
//       currentValue,
//       drawnCards
//     );
//     if (stopVal === true) {
//       break;
//     }
//     if (err !== null) {
//       return [false, err];
//     }
//   }

//   return [true, null];
// };

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
