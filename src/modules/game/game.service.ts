import { generateRandom } from '../../utils/stringUtils';
import { generateDeck } from '../card/card.service';
import { GameStatus, ICard, IGame, IPlayer } from './game.interfaces';
import Game from './game.model';

export const diffCards = (cardSource: ICard[], drawnCards: ICard[]) => {
  const drawnIdentifiers = drawnCards.map(card => card.identifier);
  return cardSource.filter(card => !drawnIdentifiers.includes(card.identifier));
};

type NextPlayerArg = {
  players: IPlayer[];
  currentPlayerSocketId: string;
  direction?: number;
  skips?: number;
};

export const getNextPlayer = ({
  players,
  currentPlayerSocketId,
  direction = 1,
  skips = 0,
}: NextPlayerArg) => {
  const curIndex = players.findIndex(
    item => item.socketId === currentPlayerSocketId,
  );
  if (curIndex === -1) throw new Error('Current id not in players list');

  let nextIndex = curIndex + direction + direction * skips;
  if (nextIndex < 0) {
    nextIndex += players.length;
  }
  if (nextIndex > players.length - 1) {
    nextIndex %= players.length;
  }

  return players[nextIndex];
};

export const usernameTaken = async (gameId: string, username: string) => {
  const game = await Game.findById(gameId);
  if (game) {
    const userIndex = game.players.findIndex(i => i.username === username);
    return userIndex !== -1;
  }

  return false;
};

export const dealPlayer = async (
  gameId: string,
  socketId: string,
  cardCount: number,
) => {
  const game = await Game.findById(gameId);

  if (game) {
    const playerCards = game.deck.slice(0, cardCount);
    const playersUpdate = game.players.map(player =>
      player.socketId === socketId
        ? {
            ...player.toJSON(),
            cards: playerCards,
          }
        : player.toJSON(),
    );
    await Game.findByIdAndUpdate(gameId, {
      $set: {
        deck: game.deck.slice(cardCount),
        players: playersUpdate,
      },
    });
  }
};

export const startGame = async (gameId: string) => {
  const game = await Game.findById(gameId);
  if (game) {
    for (let i = 0; i < game.players.length; i++) {
      const handSize = i === 0 ? game.handSize + 1 : game.handSize;
      await dealPlayer(gameId, game.players[i].socketId, handSize);
    }
    await Game.findByIdAndUpdate(gameId, {
      $set: {
        gameStatus: GameStatus.Started,
      },
    });
  }

  return Game.findById(gameId);
};

type JoinArg = {
  socketId: string;
  username: string;
};

export const joinGame = async (
  gameId: string,
  { socketId, username }: JoinArg,
) => {
  const game = await Game.findById(gameId);

  if (game) {
    await Game.findByIdAndUpdate(gameId, {
      $push: {
        players: {
          socketId,
          username,
          isStarter: false,
          cards: [],
        },
      },
    });

    return true;
  }

  return false;
};

export const generateTag = async () => {
  let tag = '';
  while (true) {
    tag = generateRandom(5);
    const game = await Game.findOne({
      joinTag: tag,
    });
    if (!game) {
      break;
    }
  }

  return tag;
};

export const createGame = async (socketId: string, username: string) => {
  const tag = await generateTag();
  const newGame = await Game.create({
    players: [
      {
        username,
        socketId,
        isStarter: true,
        cards: [],
      },
    ],
    joinTag: tag,
    deck: generateDeck(),
    currentHand: [],
    currentSuite: '',
    currentPlayerSocketId: socketId,
  });

  return newGame;
};

export const findGame = async gameId => Game.findById(gameId);

export const finishGame = async (gameId: string) => {
  return Game.findByIdAndUpdate(
    gameId,
    {
      $set: { gameStatus: GameStatus.Finished },
    },
    { new: true },
  );
};

export const getPlayer = (
  players: IPlayer[],
  playerSocketId: string,
): Partial<IPlayer> => {
  const player = players.find(item => item.socketId === playerSocketId);

  return {
    username: player.username,
    socketId: playerSocketId,
  };
};

export const diffArray = (srcArr: string[], diffArr: string[]) => {
  let newArr = [...srcArr];
  diffArr.forEach(item => {
    const index = newArr.findIndex(i => i === item);
    if (index !== -1) {
      newArr.splice(index, 1);
    }
  });

  return newArr;
};

export const updatePlayerCards = async (
  curGame: IGame,
  playerIndex: number,
  movedDeck: ICard[],
) => {
  const playerCards = curGame.players[playerIndex].cards;
  const movedIdentifiers = movedDeck.map(item => item.identifier);
  const cardIdentifiers = playerCards.map(item => item.identifier);
  const diffIdentifiers = diffArray(cardIdentifiers, movedIdentifiers);
  const newCards = playerCards.filter(item =>
    diffIdentifiers.includes(item.identifier),
  );
  const { players } = curGame;
  players[playerIndex].cards = newCards;

  return Game.findByIdAndUpdate(
    curGame.id,
    {
      players,
    },
    { new: true },
  );
};
