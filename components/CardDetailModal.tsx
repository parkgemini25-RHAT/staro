import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DrawnCard } from '../types';
import { getCardImagePath, getCardRarity, RARITY_LABELS } from '../utils/cardAssets';
import { getCardMeaning, getCardDetail } from '../constants/cardMeanings';

interface CardDetailModalProps {
  card: DrawnCard;
  positionLabel: string;
  onClose: () => void;
}

// Full pokemon-cards-css treatment (poke-holo.simey.me): pointer drives CSS vars
// consumed by 3d transforms + gradient/blend/filter shine layers in index.css.
const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, positionLabel, onClose }) => {
  const pkcRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const rarity = getCardRarity(card);
  const meaning = getCardMeaning(card.name);
  const detail = getCardDetail(card.name);
  const imageUrl = getCardImagePath(card);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = pkcRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    const cx = px - 0.5;
    const cy = py - 0.5;
    setIsInteracting(true);
    el.style.setProperty('--px', `${(px * 100).toFixed(2)}%`);
    el.style.setProperty('--py', `${(py * 100).toFixed(2)}%`);
    el.style.setProperty('--rx', `${(cy * -22).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(cx * 26).toFixed(2)}deg`);
    el.style.setProperty('--pfc', Math.min(1, Math.hypot(cx, cy) * 2).toFixed(3));
    // background shift + pointer-from-left/top, per the original framework vars
    el.style.setProperty('--bgx', `${(37 + px * 26).toFixed(2)}%`);
    el.style.setProperty('--bgy', `${(33 + py * 34).toFixed(2)}%`);
    el.style.setProperty('--pfl', px.toFixed(3));
    el.style.setProperty('--pft', py.toFixed(3));
  };

  const handlePointerLeave = () => {
    const el = pkcRef.current;
    if (!el) return;
    setIsInteracting(false);
    el.style.setProperty('--px', '50%');
    el.style.setProperty('--py', '50%');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--pfc', '0');
    el.style.setProperty('--bgx', '50%');
    el.style.setProperty('--bgy', '50%');
    el.style.setProperty('--pfl', '0.5');
    el.style.setProperty('--pft', '0.5');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#05030b]/85 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl my-auto rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,10,29,0.94),rgba(10,6,18,0.96))] p-5 md:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d6b36a]/70 to-transparent" />
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-[#cdb682] transition hover:border-[#d6b36a]/50 hover:text-[#fff7e8]"
        >
          ✕
        </button>

        <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr] md:gap-10 items-center">
          {/* Left: interactive holo card */}
          <div className="mx-auto w-full max-w-[280px] md:max-w-[340px]">
            <div
              ref={pkcRef}
              data-rarity={rarity}
              className={`pkc ${isInteracting ? 'interacting' : 'idle'}`}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <div className="pkc__rotator aspect-[2/3] w-full">
                <img
                  src={imageUrl}
                  alt={card.name}
                  draggable={false}
                  className={`h-full w-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                />
                <div className="pkc__shine" />
                <div className="pkc__glare" />
                <div className="pkc__idle-sheen" />
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-[#cdb682]/70">
              {RARITY_LABELS[rarity]}
            </p>
          </div>

          {/* Right: card explanation (instant, from local data) */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d6b36a]/35 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3d98b]">
                {positionLabel}
              </span>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${card.isReversed ? 'border-white/20 text-[#e7def8]/75' : 'border-[#d6b36a]/40 text-[#f0d48a]'}`}>
                {card.isReversed ? 'Reversed · 역방향' : 'Upright · 정방향'}
              </span>
            </div>

            <h2 className="mt-4 font-display text-3xl md:text-4xl text-[#fff7e8]">{card.name}</h2>
            <p className="mt-1 text-sm text-[#cdb682]">
              {card.nameKo}
              {detail && <span className="ml-2 text-[#9f96b8]">· {detail.element}</span>}
            </p>

            {meaning ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {meaning.keywords.map((kw) => (
                    <span key={kw} className="rounded-full bg-[#f0d48a]/10 border border-[#d6b36a]/20 px-3 py-1 text-xs text-[#efe4bf]">
                      {kw}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-6 text-[#c9bfe4]/90">{meaning.symbol}</p>

                {detail && (
                  <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/4 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#cdb682] mb-1.5">심층 해설</p>
                    <p className="text-sm leading-6 text-[#ece3ff]/92">{detail.detail}</p>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <div className={`rounded-[1rem] border p-4 transition ${!card.isReversed ? 'border-[#d6b36a]/40 bg-[#f0d48a]/8' : 'border-white/8 bg-white/3 opacity-55'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f0d48a] mb-1.5">정방향</p>
                    <p className="text-sm leading-6 text-[#ece3ff]/95">
                      <span className="font-medium text-[#fff7e8]">{meaning.upright}</span>
                      {detail && <span className="mt-1.5 block text-[#ece3ff]/85">{detail.uprightDetail}</span>}
                    </p>
                  </div>
                  <div className={`rounded-[1rem] border p-4 transition ${card.isReversed ? 'border-[#d6b36a]/40 bg-[#f0d48a]/8' : 'border-white/8 bg-white/3 opacity-55'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9bfe4] mb-1.5">역방향</p>
                    <p className="text-sm leading-6 text-[#ece3ff]/95">
                      <span className="font-medium text-[#fff7e8]">{meaning.reversed}</span>
                      {detail && <span className="mt-1.5 block text-[#ece3ff]/85">{detail.reversedDetail}</span>}
                    </p>
                  </div>
                </div>

                {detail && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-[#f9a8d4]/20 bg-[#f9a8d4]/6 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f9c8dd] mb-1.5">연애 · 관계</p>
                      <p className="text-[13px] leading-5.5 text-[#ece3ff]/90">{detail.loveNote}</p>
                    </div>
                    <div className="rounded-[1rem] border border-[#7dd3fc]/20 bg-[#7dd3fc]/6 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a5e3fc] mb-1.5">일 · 재물</p>
                      <p className="text-[13px] leading-5.5 text-[#ece3ff]/90">{detail.workNote}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-5 text-sm text-[#c9bfe4]/80">이 카드의 상세 정보가 준비 중입니다.</p>
            )}

            <p className="mt-5 text-[11px] text-[#9f96b8]">
              카드 위에서 마우스나 손가락을 움직여 보세요 — 빛이 카드를 따라 흐릅니다.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardDetailModal;
