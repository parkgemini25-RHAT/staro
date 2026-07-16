import { TarotCard } from '../types';

// ── 덱/테마 ──────────────────────────────────────────────────────────
// 기능 코드는 공유하고, 덱 이미지와 디자인 토큰·카피만 테마로 갈아끼운다.
export type ThemeId = 'starot' | 'tangttung';

export const DEFAULT_THEME: ThemeId = 'starot';

export const DECKS: Record<ThemeId, { name: string; dir: string }> = {
  starot: { name: 'Starot', dir: '/decks/starot' },
  tangttung: { name: '얼렁탕뚱', dir: '/decks/tangttung' },
};

const COURT_RANKS: Record<string, number> = { Page: 11, Knight: 12, Queen: 13, King: 14 };

const cardFileName = (card: TarotCard): string => {
  if (card.arcana === 'Major') {
    return `major-${(card.number as number).toString().padStart(2, '0')}.jpg`;
  }
  const suit = (card.suit || '').toLowerCase();
  const rank = typeof card.number === 'number' ? card.number : COURT_RANKS[card.number as string] || 0;
  return `${suit}-${rank.toString().padStart(2, '0')}.jpg`;
};

// Maps a card to its bundled image (major-00.jpg, wands-01.jpg, ...)
export const getCardImagePath = (card: TarotCard, theme: ThemeId = DEFAULT_THEME): string =>
  `${DECKS[theme].dir}/${cardFileName(card)}`;

// 갤러리 그리드용 경량 썸네일 (440px, ~50KB) — 상세 보기는 원본을 쓴다
export const getCardThumbPath = (card: TarotCard, theme: ThemeId = DEFAULT_THEME): string =>
  `${DECKS[theme].dir}/thumbs/${cardFileName(card)}`;

export const getCardBackPath = (theme: ThemeId = DEFAULT_THEME): string =>
  `${DECKS[theme].dir}/back.jpg`;

// Holo rarity tiers (pokemon-cards-css style), mapped to tarot hierarchy:
// Major Arcana → galaxy (rainbow secret), Court/Ace → foil (regular holo), pips → glossy
export type CardRarity = 'galaxy' | 'foil' | 'glossy';

export const getCardRarity = (card: TarotCard): CardRarity => {
  if (card.arcana === 'Major') return 'galaxy';
  if (typeof card.number === 'string' || card.number === 1) return 'foil';
  return 'glossy';
};
