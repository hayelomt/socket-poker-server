import { expect } from 'chai';
import sinon from 'sinon';
import {
  generateDeck,
  cardRules,
  cardRulesOrder,
  validateCardDraw,
  deckStats,
} from '../../src/modules/card/card.service';
import {
  pokerSuiteValues,
  suiteChangerCards,
} from '../../src/modules/card/cardTypes';
import * as cardUtils from '../../src/modules/card/cardUtils';
import { genCards } from '../testUtils';

const sandbox = sinon.createSandbox();

describe('CardService', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('deckStats', () => {
    describe('isSuiteChanger', () => {
      it('checks changer', () => {
        expect(deckStats.isSuiteChanger(genCards(['club_8']))).to.be.true;
        expect(deckStats.isSuiteChanger(genCards(['heart_jack']))).to.be.true;
        expect(deckStats.isSuiteChanger(genCards(['club+8', 'heart_jack']))).to
          .be.false;
        expect(
          deckStats.isSuiteChanger(
            genCards([
              'club_1',
              'club_2',
              'club_5',
              'joker_1',
              'heart_queen',
              'diamond_king',
            ]),
          ),
        ).to.be.false;

        expect(
          deckStats.isSuiteChanger(
            genCards(['club_1', `heart_${suiteChangerCards[0]}`]),
          ),
        ).to.be.false;
        expect(
          deckStats.isSuiteChanger(
            genCards(['club_1', `spade_${suiteChangerCards[1]}`]),
          ),
        ).to.be.false;
      });
    });

    describe('isAce', () => {
      it('returns ace count', () => {
        expect(deckStats.isAce(genCards(['club_1']))).to.be.true;
        expect(deckStats.isAce(genCards(['joker_1']))).to.be.false;
        expect(deckStats.isAce(genCards(['club_1', 'heart_1']))).to.be.false;
        expect(deckStats.isAce(genCards(['club_3']))).to.be.false;
      });
    });

    describe('isSkipper', () => {
      it('returns skips', () => {
        expect(deckStats.isSkipper(genCards(['club_5']))).to.be.true;
        expect(deckStats.isSkipper(genCards(['club_1']))).to.be.false;
        expect(deckStats.isSkipper(genCards(['club_5', 'club_1', 'diamond_5'])))
          .to.be.false;
      });
    });

    describe('isDirectionChanger', () => {
      it('validates is changer', () => {
        expect(deckStats.isDirectionChanger(genCards(['club_7']))).to.be.true;
      });

      it('returns false', () => {
        expect(deckStats.isDirectionChanger(genCards(['club_7', 'club_1']))).to
          .be.false;
        expect(deckStats.isDirectionChanger(genCards(['club_4']))).to.be.false;
      });
    });

    describe('isJoker', () => {
      it('returns true', () => {
        expect(deckStats.isJoker(genCards(['joker_3']))).to.be.true;
      });

      it('returns false', () => {
        expect(deckStats.isJoker(genCards(['joker_1', 'joker_2']))).to.be.false;
        expect(deckStats.isJoker(genCards(['club_1', 'joker_2']))).to.be.false;
        expect(deckStats.isJoker(genCards(['club_1']))).to.be.false;
      });
    });

    describe('isEmpty', () => {
      it('returns true', async () => {
        expect(deckStats.isEmpty([])).to.be.true;
      });
      it('returns false', async () => {
        expect(deckStats.isEmpty(genCards(['club_1']))).to.be.false;
      });
    });
  });

  describe('validateCardDraw', () => {
    // Passes
    it('validates empty', () => {
      const [pass, err] = validateCardDraw('', '', []);
      expect(pass).to.be.true;
      expect(err).to.not.exist;
    });
    it('validates joker', () => {
      const [pass, err] = validateCardDraw('', '', genCards(['joker_1']));
      expect(pass).to.be.true;
      expect(err).to.not.exist;
    });
    it('validates eight', () => {
      const [pass, err] = validateCardDraw('', '', genCards(['heart_8']));
      expect(pass).to.be.true;
      expect(err).to.not.exist;
    });
    it('validates single match', () => {
      const [pass, err] = validateCardDraw('club', '9', genCards(['club_3']));
      expect(pass).to.be.true;
      expect(err).to.not.exist;
    });
    it('validates multi', () => {
      const [pass, err] = validateCardDraw(
        'club',
        '1',
        genCards(['club_7', 'club_4', 'club_king']),
      );
      expect(pass).to.be.true;
      expect(err).to.not.exist;
    });

    // Fails
    it('fails on single mismatch', () => {
      const [pass, err] = validateCardDraw('club', '9', genCards(['spade_3']));
      expect(pass).to.be.false;
      expect(err).to.deep.equal(cardUtils.cardValMessages.singleMismatch());
    });
    it('fails multi not same', () => {
      const [pass, err] = validateCardDraw(
        'club',
        '1',
        genCards(['club_7', 'diamond_4', 'club_king']),
      );
      expect(pass).to.be.false;
      expect(err).to.deep.equal(cardUtils.cardValMessages.mismatchedSuites());
    });
    it('fails multi not same with current suite', () => {
      const [pass, err] = validateCardDraw(
        'diamond',
        '1',
        genCards(['club_7', 'club_4', 'club_king']),
      );
      expect(pass).to.be.false;
      expect(err).to.deep.equal(cardUtils.cardValMessages.multiSuiteMismatch());
    });
    it('fails multi missing 7', () => {
      const [pass, err] = validateCardDraw(
        'club',
        '1',
        genCards(['club_6', 'club_4', 'club_king']),
      );
      expect(pass).to.be.false;
      expect(err).to.deep.equal(cardUtils.cardValMessages.missing7());
    });
  });

  describe('cardRulesOrder', () => {
    it('returns order validation rules', () => {
      const ruleOrders = [
        'validateEmpty',
        'validateJoker',
        'validateEight',
        'validateSingleSameWithCurrentSuiteOrValue',
        'validateMultiSameSuites',
        'validateMultiSameWithCurrentSuite',
        'validateMultiHas7',
      ];

      expect(cardRulesOrder).to.deep.equal(ruleOrders);
    });
  });

  describe('cardRules', () => {
    describe('validateMultiHas7', () => {
      it('passes if 7', () => {
        const [stopVal, err] = cardRules.validateMultiHas7(
          '',
          '',
          genCards(['club_1', 'club_7']),
        );

        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });

      it('returns error', () => {
        const [stopVal, err] = cardRules.validateMultiHas7(
          '',
          '',
          genCards(['club_1', 'club_2']),
        );

        expect(stopVal).to.be.false;
        expect(err).to.deep.equal(cardUtils.cardValMessages.missing7());
      });
    });

    describe('validateMultiSameWithCurrentSuite', () => {
      it('returns true for same suite', () => {
        let [stopVal, err] = cardRules.validateMultiSameWithCurrentSuite(
          pokerSuiteValues.club,
          '',
          genCards(['club_1', 'club_2']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;

        [stopVal, err] = cardRules.validateMultiSameWithCurrentSuite(
          pokerSuiteValues.club,
          '',
          genCards(['club_1']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });

      it('returns no err for joker as cur suite', () => {
        const [stopVal, err] = cardRules.validateMultiSameWithCurrentSuite(
          'joker',
          '',
          genCards(['club_1', 'club_2']),
        );

        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });

      it('returns false for diff suite', () => {
        const [stopVal, err] = cardRules.validateMultiSameWithCurrentSuite(
          pokerSuiteValues.club,
          '',
          genCards(['diamond_2', 'club_1']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.deep.equal(
          cardUtils.cardValMessages.multiSuiteMismatch(),
        );
      });
    });

    describe('validateMultiSameSuites', () => {
      it('returns error for jumbled suites', () => {
        const [stopVal, err] = cardRules.validateMultiSameSuites(
          '',
          '',
          genCards(['club_1', 'heart_1']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.deep.equal(cardUtils.cardValMessages.mismatchedSuites());
      });

      it('passes validation for same suite', () => {
        let [stopVal, err] = cardRules.validateMultiSameSuites(
          '',
          '',
          genCards(['club_1', 'club_2']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;

        [stopVal, err] = cardRules.validateMultiSameSuites(
          '',
          '',
          genCards(['joker_1']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });
    });

    describe('validateSingleSameSuiteOrValue', () => {
      it('validates same suite or value', () => {
        let [stopVal, err] =
          cardRules.validateSingleSameWithCurrentSuiteOrValue(
            'club',
            '6',
            genCards(['club_9']),
          );

        expect(stopVal).to.be.true;
        expect(err).to.not.exist;

        [stopVal, err] = cardRules.validateSingleSameWithCurrentSuiteOrValue(
          'diamond',
          '6',
          genCards(['club_6']),
        );

        expect(stopVal).to.be.true;
        expect(err).to.not.exist;
      });

      it('validates any for joker', () => {
        const [stopVal, err] =
          cardRules.validateSingleSameWithCurrentSuiteOrValue(
            'joker',
            '3',
            genCards(['club_9']),
          );

        expect(stopVal).to.be.true;
        expect(err).to.not.exist;
      });

      it('validates any for firstMove (empty currentSuite)', () => {
        const [stopVal, err] =
          cardRules.validateSingleSameWithCurrentSuiteOrValue(
            '',
            '',
            genCards(['club_9']),
          );

        expect(stopVal).to.be.true;
        expect(err).to.not.exist;
      });

      it('returns error for mismatch', () => {
        const [stopVal, err] =
          cardRules.validateSingleSameWithCurrentSuiteOrValue(
            'club',
            '6',
            genCards(['diamond_9']),
          );

        expect(stopVal).to.be.false;
        expect(err).to.deep.equal(cardUtils.cardValMessages.singleMismatch());
      });

      it('passes multi cards', () => {
        const [stopVal, err] =
          cardRules.validateSingleSameWithCurrentSuiteOrValue(
            'club',
            '6',
            genCards(['club_4', 'club_2']),
          );

        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });
    });

    describe('validateEight', () => {
      it('stops validation if card is eight', () => {
        const [stopVal, err] = cardRules.validateEight(
          '',
          '',
          genCards(['diamond_8']),
        );
        expect(stopVal).to.be.true;
        expect(err).to.not.exist;
      });

      it('continues if not eight or is mixed', () => {
        let [stopVal, err] = cardRules.validateEight(
          '',
          '',
          genCards(['diamond_king']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;

        [stopVal, err] = cardRules.validateEight(
          '',
          '',
          genCards(['diamond_8', 'diamond_king']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });
    });

    describe('validateJoker', () => {
      it('stops validation if card is joker', () => {
        const [stopVal, err] = cardRules.validateJoker(
          '',
          '',
          genCards(['joker_1']),
        );
        expect(stopVal).to.be.true;
        expect(err).to.not.exist;
      });

      it('continues if not joker or is mixed', () => {
        let [stopVal, err] = cardRules.validateJoker(
          '',
          '',
          genCards(['diamond_king']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;

        [stopVal, err] = cardRules.validateJoker(
          '',
          '',
          genCards(['joker_1', 'diamond_king']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });
    });

    describe('validateEmpty', () => {
      it('returns stop validation for empty cards', () => {
        const [stopValidation, err] = cardRules.validateEmpty('', '', []);
        expect(stopValidation).to.be.true;
        expect(err).to.not.exist;
      });

      it('passes to next if card has items', () => {
        const [stopVal, err] = cardRules.validateEmpty(
          '',
          '',
          genCards(['card_1']),
        );
        expect(stopVal).to.be.false;
        expect(err).to.not.exist;
      });
    });
  });

  describe('generateDeck', () => {
    it('generates deck', () => {
      sandbox.stub(cardUtils, 'shuffle').callsFake(i => i);

      const deck = generateDeck();
      expect(deck.length).to.equal(55);
      expect(deck[0]).to.deep.equal({
        identifier: 'club_1',
        suite: 'club',
        value: '1',
        title: '1 of Club',
      });
      expect(deck[deck.length - 1]).to.deep.equal({
        identifier: 'joker_3',
        suite: 'joker',
        value: '3',
        title: '3 of Joker',
      });
    });
  });
});
