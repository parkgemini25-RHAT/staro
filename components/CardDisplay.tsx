
import React, { useState, useMemo, useEffect } from 'react';
import { DrawnCard } from '../types';

interface CardDisplayProps {
  card: DrawnCard;
  delay: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, delay }) => {
  // Image Loading State
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const positionLabels = {
    past: '과거 (Past)',
    present: '현재 (Present)',
    future: '미래 (Future)',
    advice: '조언 (Advice)'
  };

  // --- Helper Functions for URL Generation ---

  const getRankNum = (card: DrawnCard): number => {
    if (typeof card.number === 'number') return card.number;
    const courts: Record<string, number> = { Page: 11, Knight: 12, Queen: 13, King: 14 };
    return courts[card.number as string] || 0;
  };

  const getRankName = (num: number): string => {
    if (num === 1) return "Ace";
    if (num === 11) return "Page";
    if (num === 12) return "Knight";
    if (num === 13) return "Queen";
    if (num === 14) return "King";
    return num.toString();
  };

  // Generate a robust list of image URLs to try in order
  const imageCandidates = useMemo(() => {
    const candidates: string[] = [];
    
    // Base Data
    const rankNum = getRankNum(card); // 1-14
    const rankName = getRankName(rankNum); // Ace, 2...10, Page...
    const suit = (card.suit || '').toLowerCase(); // wands
    const suitCap = suit.charAt(0).toUpperCase() + suit.slice(1); // Wands
    
    // Coins Variant (Pentacles is often Coins in RWS/Wiki)
    const suitCoins = suit === 'pentacles' ? 'coins' : suit;
    const suitCoinsCap = suitCoins.charAt(0).toUpperCase() + suitCoins.slice(1);

    // Codes
    const rankCode2 = rankNum.toString().padStart(2, '0'); // 01, 11
    
    // Sacred Texts Codes (ac, 02..10, pa, kn, qu, ki)
    let stRank = rankCode2;
    if (rankNum === 1) stRank = 'ac';
    if (rankNum === 11) stRank = 'pa';
    if (rankNum === 12) stRank = 'kn';
    if (rankNum === 13) stRank = 'qu';
    if (rankNum === 14) stRank = 'ki';
    const stSuit = { wands: 'wa', cups: 'cu', swords: 'sw', pentacles: 'pe' }[suit] || 'wa';

    // --- PRIORITY 1: Wikimedia Commons (Highly Requested & Reliable for RWS) ---
    // Using Special:FilePath to handle redirects. 
    // Format: Swords11.jpg (Page of Swords), Pentacles01.jpg (Ace)
    if (card.arcana === 'Minor') {
        // Standard RWS on Wiki: "Swords11.jpg"
        candidates.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${suitCap}${rankCode2}.jpg?width=500`);
        
        // Coins variant: "Coins11.jpg"
        if (suit === 'pentacles') {
            candidates.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${suitCoinsCap}${rankCode2}.jpg?width=500`);
        }

        // Alternative Wiki Name: "Page_of_Swords.jpg"
        candidates.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${rankName}_of_${suitCap}.jpg?width=500`);
    } else {
        // Major Arcana on Wiki
        // Format: "RWS_Tarot_00_Fool.jpg" or "RWS_Tarot_01_Magician.jpg"
        const majNum = (card.number as number).toString().padStart(2, '0');
        // Try precise RWS name first
        candidates.push(`https://commons.wikimedia.org/wiki/Special:FilePath/RWS_Tarot_${majNum}_${card.name.replace(/ /g, '_')}.jpg?width=500`);
        
        // Try simple name "The_Fool.jpg" (Less reliable due to disambiguation, but worth a shot)
        candidates.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${card.name.replace(/ /g, '_')}.jpg?width=500`);
    }

    // --- PRIORITY 2: Sacred Texts (Fast, Standard PKT) ---
    // Fix: Using stRank (pa, kn) instead of numbers for courts
    if (card.arcana === 'Major') {
        const majNum = (card.number as number).toString().padStart(2, '0');
        candidates.push(`https://www.sacred-texts.com/tarot/pkt/img/ar${majNum}.jpg`);
    } else {
        candidates.push(`https://www.sacred-texts.com/tarot/pkt/img/${stSuit}${stRank}.jpg`);
    }

    // --- PRIORITY 3: L-A-M-A GitHub (High Res, Full Names) ---
    // "Page of Swords.jpg", "Ace of Pentacles.jpg"
    const lamaName = card.arcana === 'Major' ? card.name : `${rankName} of ${suitCap}`;
    candidates.push(`https://raw.githubusercontent.com/L-A-M-A/Tarot-Deck/main/images/${encodeURIComponent(lamaName)}.jpg`);

    // --- PRIORITY 4: Tindogg (Backup, standardized codes) ---
    // "s11.jpg", "w01.jpg"
    if (card.arcana === 'Major') {
        const majNum = (card.number as number).toString().padStart(2, '0');
        candidates.push(`https://raw.githubusercontent.com/tindogg/tarot-api/master/static/card_images/major${majNum}.jpg`);
    } else {
        // Tindogg uses single letter suit + 2 digit rank (01..14)
        const tinySuit = suit.charAt(0);
        candidates.push(`https://raw.githubusercontent.com/tindogg/tarot-api/master/static/card_images/${tinySuit}${rankCode2}.jpg`);
    }

    return candidates;
  }, [card]);

  // Reset when card changes
  useEffect(() => {
    setCurrentCandidateIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [card]);

  const activeUrl = imageCandidates[currentCandidateIndex % imageCandidates.length];

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.warn(`Image failed: ${activeUrl}. Trying next candidate...`);
    
    // Auto-Retry: Move to next candidate
    if (currentCandidateIndex < imageCandidates.length - 1) {
        setCurrentCandidateIndex(prev => prev + 1);
        setIsLoading(true); // Keep loading state
    } else {
        // All candidates failed
        setIsLoading(false);
        setHasError(true);
    }
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

           {/* The Image — slight desaturation to harmonize mixed-source scans */}
           {!hasError && (
               <img
                 key={`${card.id}-${currentCandidateIndex}`}
                 src={activeUrl}
                 alt={card.name}
                 className={`relative w-full h-full object-cover z-10 saturate-[.85] contrast-[.97] transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                 onLoad={handleImageLoad}
                 onError={handleImageError}
                 // Add referrer policy to help with some image hosts
                 referrerPolicy="no-referrer"
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
