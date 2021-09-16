import { cardEvents } from '../card/card.events';
import { IGame } from './game.interfaces';
import Game from './game.model';
import { finishGame } from './game.service';

export const finalizeMove = async ({ io, cardPlayerSocketId }, game: IGame) => {
  const playerIndex = game.players.findIndex(
    player => player.socketId === cardPlayerSocketId,
  );
  const updatedGame = await Game.findById(game.id);
  const playerCards = updatedGame.players[playerIndex].cards;
  if (!playerCards.length) {
    await finishGame(game.id);
    io.in(game.id).emit('game:finished', {
      winner: updatedGame.players[playerIndex].username,
    });
  } else if (playerCards.length === 1) {
    io.in(game.id).emit(
      cardEvents.cardLeft,
      updatedGame.players[playerIndex].username,
    );
  }
};
