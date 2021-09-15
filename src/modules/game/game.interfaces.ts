import { PokerIdentifers, PokerSuite, PokerValue } from '../card/cardTypes';

export interface ICard {
  identifier: PokerIdentifers;
  title: string;
  suite: PokerSuite;
  value: PokerValue;
}

export interface IPlayer {
  username: string;
  socketId: string;
  isStarter: boolean;
  cards: ICard[];
}

export const CardType = {
  title: { type: String, required: true },
  identifier: { type: String, required: true },
  suite: { type: String, required: true },
  value: { type: String, required: true },
};

export const PlayerType = {
  username: { type: String, required: true },
  socketId: { type: String, required: true },
  isStarter: { type: Boolean, default: false },
  cards: [CardType],
};

export interface IGame extends Document {
  id: string;
  joinTag: string;
  deck: ICard[];
  players: [IPlayer];
  topCard?: ICard;
  currentPlayerSocketId?: string;
  currentHand: ICard[];
  lastDealtCards: ICard[];
  handSize: number;
  direction: number;
  currentSuite: string;
  currentValue: string;
  currentPlayerHasDrawnCard: boolean;
  gameStatus: string;
}

export enum GameStatus {
  Pending = 'PENDING',
  Started = 'STARTED',
  Finished = 'FINISHED',
  Abandoned = 'ABANDONED',
}

export type PlayDirection = 1 | -1;
