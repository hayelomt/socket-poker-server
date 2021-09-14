export type PokerValue =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'jack'
  | 'queen'
  | 'king';

export type PokerSuite = 'club' | 'diamond' | 'heart' | 'spade' | 'joker';

export type PokerIdentifers =
  | 'club_1'
  | 'club_2'
  | 'club_3'
  | 'club_4'
  | 'club_5'
  | 'club_6'
  | 'club_7'
  | 'club_8'
  | 'club_9'
  | 'club_10'
  | 'club_jack'
  | 'club_queen'
  | 'club_king'
  | 'diamond_1'
  | 'diamond_2'
  | 'diamond_3'
  | 'diamond_4'
  | 'diamond_5'
  | 'diamond_6'
  | 'diamond_7'
  | 'diamond_8'
  | 'diamond_9'
  | 'diamond_10'
  | 'diamond_jack'
  | 'diamond_queen'
  | 'diamond_king'
  | 'heart_1'
  | 'heart_2'
  | 'heart_3'
  | 'heart_4'
  | 'heart_5'
  | 'heart_6'
  | 'heart_7'
  | 'heart_8'
  | 'heart_9'
  | 'heart_10'
  | 'heart_jack'
  | 'heart_queen'
  | 'heart_king'
  | 'spade_1'
  | 'spade_2'
  | 'spade_3'
  | 'spade_4'
  | 'spade_5'
  | 'spade_6'
  | 'spade_7'
  | 'spade_8'
  | 'spade_9'
  | 'spade_10'
  | 'spade_jack'
  | 'spade_queen'
  | 'spade_king'
  | 'joker_1'
  | 'joker_2'
  | 'joker_3';

export const PokerIdentifierValues = [
  'club_1',
  'club_2',
  'club_3',
  'club_4',
  'club_5',
  'club_6',
  'club_7',
  'club_8',
  'club_9',
  'club_10',
  'club_jack',
  'club_queen',
  'club_king',
  'diamond_1',
  'diamond_2',
  'diamond_3',
  'diamond_4',
  'diamond_5',
  'diamond_6',
  'diamond_7',
  'diamond_8',
  'diamond_9',
  'diamond_10',
  'diamond_jack',
  'diamond_queen',
  'diamond_king',
  'heart_1',
  'heart_2',
  'heart_3',
  'heart_4',
  'heart_5',
  'heart_6',
  'heart_7',
  'heart_8',
  'heart_9',
  'heart_10',
  'heart_jack',
  'heart_queen',
  'heart_king',
  'spade_1',
  'spade_2',
  'spade_3',
  'spade_4',
  'spade_5',
  'spade_6',
  'spade_7',
  'spade_8',
  'spade_9',
  'spade_10',
  'spade_jack',
  'spade_queen',
  'spade_king',
  'joker_1',
  'joker_2',
  'joker_3',
];

export const PokerCounts = {
  joker: 10,
  ace: 2,
  crazy: 5,
};

export const suiteChangerCards = ['8', 'jack'];

export const directionChangerCard = '7';

export const skipperCard = '5';
