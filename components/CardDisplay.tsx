
import React, { useState } from 'react';
import { DrawnCard } from '../types';

interface CardDisplayProps {
  card: DrawnCard;
  delay: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, delay }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const positionLabels = {
    past: '과거 (Past)',
    present: '현재 (Present)',
    future: '미래 (Future)',
    advice: '조언 (Advice)'
  };

  const getImagePath = (): string => {
    if (card.arcana === 'Major') {
      const majNum = (card.number as number).toString().padStart(2, '0');
      return `/cards/major-${majNum}.png`;
    } else {
      const suit = (card.suit || '').toLowerCase();
      const rankNum = typeof card.number === 'number' ? card.number : { Page: 11, Knight: 12, Queen: 13, King: 14 }[card.number as string] || 0;
      const rankCode = rankNum.toString().padStart(2, '0');
      return `/cards/${suit}-${rankCode}.png`;
    }
  };

  const imageUrl = getImagePath();

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error(`Image failed to load: ${imageUrl}`);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className="flex flex-col items-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#cdb682] mb-2 font-semibold">
        {positionLabels[card.position]}
      </div>

      {/* Card Image Container */}
      <div
        className={`
          relative w-32 h-56 md:w-40 md:h-64 rounded-xl shadow-2xl
          transition-transform duration-700 hover:scale-105
          ${card.isReversed ? 'rotate-180' : ''}
        `}
      >
        <div className="w-full h-full rounded-xl overflow-hidden border border-[#d6b36a]/30 bg-[#0d0718] relative">

           {/* Fallback Placeholder (shown if all images fail) */}
           {hasError && (
             <div className="absolute inset-0 bg-[#0d0718] flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[#d6b36a]/50 text-3xl mb-2">✦</span>
                <span className="text-xs text-[#cdb682]/70">{card.name}</span>
             </div>
           )}

           {/* Loading Overlay */}
           {isLoading && !hasError && (
             <div className={`absolute inset-0 z-50 bg-[#0d0718]/85 backdrop-blur-[2px] flex flex-col items-center justify-center ${card.isReversed ? 'rotate-180' : ''}`}>
                <div className="w-8 h-8 border-2 border-[#d6b36a] border-t-transparent rounded-full animate-spin mb-2"></div>
             </div>
           )}

           {/* The Image */}
           {!hasError && (
               <img
                 key={imageUrl}
                 src={imageUrl}
                 alt={card.name}
                 className={`relative w-full h-full object-cover z-10 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                 onLoad={handleImageLoad}
                 onError={handleImageError}
               />
           )}

           {/* Tone overlay — blends scans into the midnight-indigo palette */}
           <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(180deg,rgba(26,16,44,0.18),rgba(9,5,18,0.24))] mix-blend-multiply"></div>
           <div className="absolute inset-0 z-20 pointer-events-none rounded-xl shadow-[inset_0_0_24px_rgba(9,5,18,0.55)]"></div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-[#fff7e8] font-medium font-display tracking-wide">{card.name}</p>
        <span className={`text-[10px] tracking-[0.18em] uppercase font-medium px-2.5 py-0.5 rounded-full mt-1.5 inline-block border ${card.isReversed ? 'border-white/20 text-[#e7def8]/70' : 'border-[#d6b36a]/40 text-[#f0d48a]'}`}>
          {card.isReversed ? 'Reversed' : 'Upright'}
        </span>
      </div>
    </div>
  );
};

export default CardDisplay;
