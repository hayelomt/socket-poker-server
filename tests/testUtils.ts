import mongoose from 'mongoose';
import Sinon, { SinonSandbox } from 'sinon';
import { ICard } from '../src/modules/game/game.interfaces';

export const clearDb = async () => {
  // console.log('-->clear db');
  await mongoose.connection.dropDatabase();
};

export const stripId = (arr: any[]) =>
  arr.map(item => {
    const { _id, ...restItem } = item;
    return restItem;
  });

export const genCards = (cardIdentifiers: string[]): ICard[] =>
  cardIdentifiers.map(card => ({
    identifier: card,
    suite: card.split('_')[0],
    value: card.split('_')[1],
    title: card,
  })) as ICard[];

export const stubSocketIO = (sandbox: SinonSandbox) => ({
  in: sandbox.stub().returns({
    emit: sandbox.spy(),
  }),
  to: sandbox.stub().returns({
    emit: sandbox.spy(),
  }),
});

export const stubSocket = (sandbox: SinonSandbox) => ({
  emit: sandbox.spy(),
  join: sandbox.spy(),
});
