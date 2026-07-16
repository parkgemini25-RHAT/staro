import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FULL_DECK } from '../constants';
import { TarotCard } from '../types';
import { getCardImagePath, DECKS } from '../utils/cardAssets';
import { useTheme } from '../contexts/ThemeContext';

interface DeckGalleryProps {
  onClose: () => void;
  onSelectCard: (card: TarotCard) => void;
  /** 상세 모달이 위에 떠 있는 동안 갤러리의 Esc를 잠근다 */
  suspendEsc?: boolean;
}

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'Major', label: '메이저' },
  { key: 'Wands', label: '지팡이' },
  { key: 'Cups', label: '컵' },
  { key: 'Swords', label: '검' },
  { key: 'Pentacles', label: '동전' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

// 덱 갤러리 — 랜딩 쇼케이스에서 진입하는 78장 카드 도감.
// 카드를 누르면 기존 홀로 상세 모달(레어도 효과 + 심층 해설)이 열린다.
const DeckGallery: React.FC<DeckGalleryProps> = ({ onClose, onSelectCard, suspendEsc = false }) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !suspendEsc) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, suspendEsc]);

  const cards = useMemo(() => {
    if (filter === 'all') return FULL_DECK;
    if (filter === 'Major') return FULL_DECK.filter(c => c.arcana === 'Major');
    return FULL_DECK.filter(c => c.suit === filter);
  }, [filter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[150] flex flex-col bg-bg0/92 backdrop-blur-xl"
    >
      {/* 헤더 */}
      <div className="shrink-0 border-b border-line/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-accent-muted sm:text-[10px]">Deck Gallery</p>
            <h2 className="mt-0.5 font-display text-xl text-ink-hi sm:text-2xl">
              {DECKS[theme].name} 덱 · {cards.length}장
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="갤러리 닫기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/15 bg-glass/8 text-accent-muted transition hover:border-accent/50 hover:text-ink-hi"
          >
            ✕
          </button>
        </div>
        {/* 필터 탭 */}
        <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-1.5 px-4 pb-4 sm:px-6 sm:gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] transition sm:text-sm ${filter === f.key ? 'border-accent-hi/60 bg-accent-hi/15 text-accent-soft font-medium' : 'border-line/12 bg-glass/5 text-ink/80 hover:border-accent/40 hover:text-accent-soft'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-3 px-4 py-6 sm:grid-cols-4 sm:gap-4 sm:px-6 md:grid-cols-6">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => onSelectCard(card)}
              title={`${card.nameKo} 상세 보기`}
              className="group text-left animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 18, 400)}ms`, animationFillMode: 'both' }}
            >
              <div className="overflow-hidden rounded-xl border border-accent/25 bg-surface shadow-lg transition duration-200 group-hover:-translate-y-1.5 group-hover:border-accent/60 group-hover:shadow-[0_14px_36px_rgba(214,179,106,0.28)]">
                <img
                  src={getCardImagePath(card, theme)}
                  alt={card.nameKo}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
              <p className="mt-1.5 truncate text-center text-[11px] text-ink/85 sm:text-xs">{card.nameKo}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DeckGallery;
