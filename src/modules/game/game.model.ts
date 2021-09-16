import { Schema, model, models } from 'mongoose';
import { CardType, GameStatus, IGame, PlayerType } from './game.interfaces';

const schema = new Schema<IGame>(
  {
    joinTag: { type: String, required: true },
    deck: [CardType],
    players: [PlayerType],
    topCard: {
      type: CardType,
      required: false,
    },
    currentPlayerSocketId: String,
    currentHand: [CardType],
    lastDealtCards: [CardType],
    handSize: { type: Number, default: 12 },
    direction: {
      type: Number,
      default: 1,
    },
    currentSuite: String,
    currentValue: String,
    currentPlayerHasDrawnCard: { type: Boolean, default: false },
    gameStatus: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.Pending,
    },
  },
  { timestamps: true },
);

const Game = models.Game || model<IGame>('Game', schema);

export default Game;
