import { TarotCard } from '../types';

const COURT_RANKS: Record<string, number> = { Page: 11, Knight: 12, Queen: 13, King: 14 };

// Maps a card to its bundled image in public/cards/ (major-00.png, wands-01.png, ...)
export const getCardImagePath = (card: TarotCard): string => {
  if (card.arcana === 'Major') {
    return `/cards/major-${(card.number as number).toString().padStart(2, '0')}.png`;
  }
  const suit = (card.suit || '').toLowerCase();
  const rank = typeof card.number === 'number' ? card.number : COURT_RANKS[card.number as string] || 0;
  return `/cards/${suit}-${rank.toString().padStart(2, '0')}.png`;
};

export const CARD_BACK_PATH = '/cards/back.png';

// Holo rarity tiers (pokemon-cards-css style), mapped to tarot hierarchy:
// Major Arcana → galaxy (rainbow secret), Court/Ace → foil (regular holo), pips → glossy
export type CardRarity = 'galaxy' | 'foil' | 'glossy';

export const getCardRarity = (card: TarotCard): CardRarity => {
  if (card.arcana === 'Major') return 'galaxy';
  if (typeof card.number === 'string' || card.number === 1) return 'foil';
  return 'glossy';
};
