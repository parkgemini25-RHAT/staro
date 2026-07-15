import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DrawnCard } from '../types';
import { getCardImagePath, CARD_BACK_PATH } from '../utils/cardAssets';

interface CardDisplayProps {
  card: DrawnCard & { deckId?: number };
  delay: number;
  onSelect?: () => void;
}

// Interactive holographic card, technique borrowed from simeydotme/pokemon-cards-css:
// pointer position drives CSS custom properties for 3D tilt, foil shine and glare.
const CardDisplay: React.FC<CardDisplayProps> = ({ card, delay, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);

  const positionLabels = {
    past: '과거 (Past)',
    present: '현재 (Present)',
    future: '미래 (Future)',
    advice: '조언 (Advice)'
  };

  const imageUrl = getCardImagePath(card);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    const cx = px - 0.5;
    const cy = py - 0.5;
    el.classList.add('interacting');
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    el.style.setProperty('--rx', `${(cy * -16).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(cx * 16).toFixed(2)}deg`);
    el.style.setProperty('--holo-o', `${Math.min(1, Math.hypot(cx, cy) * 2.4).toFixed(3)}`);
  };

  const handlePointerLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.classList.remove('interacting');
    el.style.setProperty('--px', '50%');
    el.style.setProperty('--py', '50%');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--holo-o', '0');
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="text-[10px] uppercase tracking-[0.25em] text-[#cdb682] mb-2 font-semibold animate-fade-in-up"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      >
        {positionLabels[card.position]}
      </div>

      {/* Flip scene: the fan card morphs here (Motion layoutId FLIP), then flips to its front */}
      <motion.div
        layoutId={card.deckId != null ? `card-${card.deckId}` : undefined}
        transition={{ layout: { type: 'spring', stiffness: 170, damping: 22 } }}
        className={`holo-scene relative w-24 h-40 sm:w-32 sm:h-56 md:w-40 md:h-64 z-40 ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={onSelect}
        title={onSelect ? '카드 상세 보기' : undefined}
      >
        <div className="holo-flip w-full h-full" style={{ animationDelay: `${delay}ms` }}>

          {/* Back face (visible during flip-in) */}
          <div className="holo-face holo-back rounded-xl overflow-hidden border border-[#d6b36a]/30 bg-[#0d0718] shadow-2xl">
            <img src={CARD_BACK_PATH} alt="card back" className="w-full h-full object-cover" />
          </div>

          {/* Front face */}
          <div className={`holo-face ${card.isReversed ? 'rotate-180' : ''}`}>
            <div
              ref={tiltRef}
              className="holo-tilt w-full h-full"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <div className="w-full h-full rounded-xl overflow-hidden border border-[#d6b36a]/30 bg-[#0d0718] relative shadow-2xl">

                {/* Fallback placeholder (if the local image fails) */}
                {hasError && (
                  <div className="absolute inset-0 bg-[#0d0718] flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-[#d6b36a]/50 text-3xl mb-2">✦</span>
                    <span className="text-xs text-[#cdb682]/70">{card.name}</span>
                  </div>
                )}

                {/* Loading overlay */}
                {isLoading && !hasError && (
                  <div className="absolute inset-0 z-50 bg-[#0d0718]/85 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#d6b36a] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* The card image */}
                {!hasError && (
                  <img
                    src={imageUrl}
                    alt={card.name}
                    className={`relative w-full h-full object-cover z-10 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => { setIsLoading(false); setHasError(false); }}
                    onError={() => { console.error(`Image failed to load: ${imageUrl}`); setIsLoading(false); setHasError(true); }}
                  />
                )}

                {/* Holographic foil + glare (pointer-driven) */}
                <div className="holo-shine"></div>
                <div className="holo-glare"></div>

                {/* Inner vignette to seat the art in the frame */}
                <div className="absolute inset-0 z-20 pointer-events-none rounded-xl shadow-[inset_0_0_24px_rgba(9,5,18,0.45)]"></div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <div
        className="mt-3 text-center animate-fade-in-up"
        style={{ animationDelay: `${delay + 250}ms`, animationFillMode: 'both' }}
      >
        <p className="text-sm text-[#fff7e8] font-medium font-display tracking-wide">{card.name}</p>
        <span className={`text-[10px] tracking-[0.18em] uppercase font-medium px-2.5 py-0.5 rounded-full mt-1.5 inline-block border ${card.isReversed ? 'border-white/20 text-[#e7def8]/70' : 'border-[#d6b36a]/40 text-[#f0d48a]'}`}>
          {card.isReversed ? 'Reversed' : 'Upright'}
        </span>
      </div>
    </div>
  );
};

export default CardDisplay;
