import React, { useState, useRef, useEffect } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { FULL_DECK } from './constants';
import { DrawnCard, ReadingResponse, ReadingState, SavedReading, ReadingPosition } from './types';
import { getTarotReading } from './services/readingService';
import { getCardImagePath, CARD_BACK_PATH } from './utils/cardAssets';
import { playStartChime, playCardFlick, playShuffleRiffle, setSfxMuted } from './utils/soundFx';
import CardDisplay from './components/CardDisplay';
import CardDetailModal from './components/CardDetailModal';
import LandingScreen from './components/LandingScreen';

// Example questions to rotate
const EXAMPLE_QUESTIONS = [
  "내년에 이직하는 게 좋을까요?",
  "그 사람의 현재 속마음은 무엇일까요?",
  "이번 프로젝트가 성공할 수 있을까요?",
  "다가오는 금전운은 어떨까요?",
  "헤어진 연인이 저를 그리워할까요?",
  "새로운 사업을 시작해도 괜찮을까요?",
  "저의 숨겨진 잠재력은 무엇인가요?",
  "오늘 하루 조심해야 할 점은 무엇인가요?",
  "이번 주말 소개팅 결과가 좋을까요?",
  "현재 겪고 있는 고민의 해결책이 있을까요?"
];

const READING_TYPES = {
  flow: {
    label: '기본 흐름',
    badge: '4장',
    positions: ['past', 'present', 'future', 'advice'] as ReadingPosition[],
    stepLabels: ['과거', '현재', '미래', '조언'],
    sectionTitles: ['과거 (Past)', '현재 (Present)', '미래 (Future)', '조언 (Advice)'],
    description: '과거-현재-미래-조언으로 가장 안정적인 리딩이에요.',
  },
  decision: {
    label: '의사결정',
    badge: '4장',
    positions: ['past', 'present', 'future', 'advice'] as ReadingPosition[],
    stepLabels: ['배경', '선택지', '전개', '결론 조언'],
    sectionTitles: ['배경 (Context)', '선택지 (Choice)', '전개 (Direction)', '결론 조언 (Advice)'],
    description: '결정을 앞둔 상황을 배경-선택지-전개-조언 구조로 봐요.',
  },
  love: {
    label: '관계/연애',
    badge: '4장',
    positions: ['past', 'present', 'future', 'advice'] as ReadingPosition[],
    stepLabels: ['관계 배경', '현재 감정', '가까운 흐름', '관계 조언'],
    sectionTitles: ['관계 배경', '현재 감정', '가까운 흐름', '관계 조언'],
    description: '관계 흐름과 감정선을 더 읽기 쉽게 보는 방식이에요.',
  },
} as const;

type ReadingTypeKey = keyof typeof READING_TYPES;

// Character-based wrapping so Korean text (no spaces to split on) breaks correctly
const wrapCanvasText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) => {
  const lines: string[] = [];
  let current = '';

  for (const ch of text) {
    if (ctx.measureText(current + ch).width > maxWidth && current) {
      lines.push(current);
      current = ch === ' ' ? '' : ch;
      if (lines.length === maxLines) break;
    } else {
      current += ch;
    }
  }
  if (lines.length < maxLines) {
    if (current) lines.push(current);
  } else {
    // Truncated: mark the last visible line
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1,2}$/, '…');
  }

  lines.forEach((line, i) => ctx.fillText(line.trim(), x, y + i * lineHeight));
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Fixed star field — module-level so positions stay stable across re-renders
const STAR_FIELD = Array.from({ length: 50 }).map(() => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 3}px`,
  delay: `${Math.random() * 5}s`,
  duration: `${2 + Math.random() * 3}s`
}));

// Shared full-viewport background: same visual language as the landing screen
const AtelierBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,182,103,0.16),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(140,98,255,0.15),transparent_28%),linear-gradient(180deg,#05030b_0%,#11071d_42%,#1a0d2c_100%)]" />
    <div className="absolute inset-0 opacity-40 mix-blend-screen [background-image:radial-gradient(circle_at_1px_1px,rgba(255,248,220,0.55)_1px,transparent_0)] [background-size:26px_26px]" />
    <div className="absolute left-[-8%] top-[12%] h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />
    <div className="absolute right-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#f59e0b]/15 blur-3xl" />
    <div className="absolute bottom-[-10%] left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-[#ec4899]/12 blur-3xl" />
    {STAR_FIELD.map((star, i) => (
      <div
        key={i}
        className="star"
        style={{
          top: star.top,
          left: star.left,
          width: star.size,
          height: star.size,
          animationDelay: star.delay,
          animationDuration: star.duration
        }}
      />
    ))}
    <div className="shooting-star" style={{ top: '10%', left: '80%', animationDelay: '2s' }}></div>
    <div className="shooting-star" style={{ top: '30%', left: '90%', animationDelay: '7s' }}></div>
  </div>
);

const STORAGE_KEY = 'starot-reading-history';
const MAX_SAVED_READINGS = 12;
const FAN_SPREAD_DEG = 110; // total arc angle of the deck fan (wide hand-fan)
const CARD_FLIGHT_MS = 450; // deck → slot layout morph duration (flip starts after this)
const MAIN_PHASE_COUNT = 3; // 통배열: 과거·현재·미래 3장 먼저, 조언 1장은 결과 후 추가로

// 뽑는 순간에 집중시키는 페이즈별 카피 (기본 흐름 리딩)
const FLOW_PICK_COPY = [
  { title: '카드를 뽑아, 과거를 바라보세요', sub: '이 고민이 시작된 자리를 비추는 첫 번째 장입니다' },
  { title: '카드를 뽑아, 지금의 흐름을 느껴보세요', sub: '당신이 서 있는 현재를 비추는 두 번째 장입니다' },
  { title: '카드를 뽑아, 다가올 미래를 열어보세요', sub: '흐름이 향하는 곳을 비추는 세 번째 장입니다' },
];

// 포지션별 강조 색상 — 뽑는 단계와 대상 슬롯을 같은 색으로 묶는다
const PHASE_ACCENTS = [
  { // 과거 — 보랏빛
    slot: 'border-[#a78bfa]/60 shadow-[0_0_30px_rgba(167,139,250,0.3)]',
    label: 'text-[#c4b5fd]',
    badge: 'border-[#a78bfa]/50 bg-[#a78bfa]/10 text-[#ddd6fe]',
  },
  { // 현재 — 금빛
    slot: 'border-[#f0d48a]/60 shadow-[0_0_30px_rgba(240,212,138,0.32)]',
    label: 'text-[#f0d48a]',
    badge: 'border-[#f0d48a]/50 bg-[#f0d48a]/10 text-[#f6e8bf]',
  },
  { // 미래 — 새벽빛
    slot: 'border-[#7dd3fc]/60 shadow-[0_0_30px_rgba(125,211,252,0.3)]',
    label: 'text-[#a5e3fc]',
    badge: 'border-[#7dd3fc]/50 bg-[#7dd3fc]/10 text-[#bae6fd]',
  },
  { // 조언 — 장밋빛
    slot: 'border-[#f9a8d4]/60 shadow-[0_0_30px_rgba(249,168,212,0.3)]',
    label: 'text-[#f9c8dd]',
    badge: 'border-[#f9a8d4]/50 bg-[#f9a8d4]/10 text-[#fbd3e5]',
  },
];

// Deterministic pseudo-random per (card id, salt) — stable across renders
const srand = (id: number, salt: number) => {
  const x = Math.sin(id * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Riffle shuffle timeline (deck-of-cards technique: cards split apart sideways,
// then merge back through each other with re-randomized stacking order — twice)
type ShufflePhase = 'split1' | 'merge1' | 'split2' | 'merge2' | null;

// A revealed card remembers which deck card it came from so Motion's layoutId
// can morph the fan card into the slot (FLIP / shared layout technique).
type PickedCard = DrawnCard & { deckId?: number };

const App: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingTypeKey>('flow');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [secretCards, setSecretCards] = useState<DrawnCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<PickedCard[]>([]);
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  // Lazy init from localStorage: loading via useEffect would let the
  // persist effect below wipe the stored history with [] on mount.
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as SavedReading[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [state, setState] = useState<ReadingState>(ReadingState.IDLE);
  const [deckCards, setDeckCards] = useState<number[]>([]);
  const [shufflePhase, setShufflePhase] = useState<ShufflePhase>(null);
  const [liftingCardId, setLiftingCardId] = useState<number | null>(null);
  const [questionCategory, setQuestionCategory] = useState<string | null>(null);
  const isShuffling = shufflePhase !== null;
  const [fanWidth, setFanWidth] = useState(0);

  // Pick sequencing: lock while a pick is in progress, queue one click made during the lock
  const pickLockRef = useRef(false);
  const pendingPickRef = useRef<number | null>(null);
  const startPickRef = useRef<(deckIndex: number) => void>(() => {});
  const fanRef = useRef<HTMLDivElement | null>(null);

  // Mute State
  const [isMuted, setIsMuted] = useState(false);

  // BGM stays a hosted loop; SFX are synthesized locally (utils/soundFx)
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-stars-in-the-night-172.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4;

    return () => {
      if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) bgmRef.current.muted = isMuted;
    setSfxMuted(isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const playSfx = (type: 'start' | 'pick' | 'shuffle') => {
    if (isMuted) return;
    if (type === 'start') playStartChime();
    if (type === 'pick') playCardFlick();
    if (type === 'shuffle') playShuffleRiffle();
  };

  const playBgm = () => {
      if (bgmRef.current) {
          if (isMuted) bgmRef.current.muted = true;
          if (bgmRef.current.paused) {
              bgmRef.current.play().catch(e => console.log("BGM play prevented:", e));
          }
      }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReadings));
    } catch (error) {
      console.error('Failed to save reading history', error);
    }
  }, [savedReadings]);

  const saveCurrentReading = (currentQuestion: string, readingType: ReadingTypeKey, cards: DrawnCard[], result: ReadingResponse) => {
    const nextItem: SavedReading = {
      id: `${Date.now()}`,
      question: currentQuestion,
      readingType,
      cards,
      reading: result,
      createdAt: new Date().toISOString(),
    };

    setSavedReadings(prev => [nextItem, ...prev].slice(0, MAX_SAVED_READINGS));
  };

  const loadSavedReading = (item: SavedReading) => {
    setQuestion(item.question);
    setSelectedReadingType((item.readingType as ReadingTypeKey) || 'flow');
    setSecretCards(item.cards);
    setRevealedCards(item.cards);
    setReading(item.reading);
    setDeckCards([]);
    setState(ReadingState.DRAWING);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSavedReading = (id: string) => {
    setSavedReadings(prev => prev.filter(item => item.id !== id));
  };

  const fillQuestionExample = () => {
    setQuestion(EXAMPLE_QUESTIONS[placeholderIndex]);
  };

  const handleStart = () => {
    if (!question.trim()) {
      setQuestionError('질문을 입력해주세요.');
      return;
    }
    setQuestionError(null);
    playSfx('start');
    playBgm();

    const config = READING_TYPES[selectedReadingType];
    // Fisher-Yates shuffle (unbiased)
    const shuffled = [...FULL_DECK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, config.positions.length);
    const finalCards: DrawnCard[] = selected.map((card, index) => ({
      ...card,
      isReversed: Math.random() < 0.3, 
      position: config.positions[index]
    }));

    setSecretCards(finalCards);
    setRevealedCards([]);
    setReading(null);
    pickLockRef.current = false;
    pendingPickRef.current = null;
    setShufflePhase(null);
    setLiftingCardId(null);
    setState(ReadingState.DRAWING);
    setDeckCards(Array.from({ length: 78 }, (_, i) => i));
    generateReadingBackground(question, finalCards);
  };

  const generateReadingBackground = async (q: string, cards: DrawnCard[]) => {
    try {
      // 선택된 카테고리를 해석 컨텍스트로 전달 (예: "기본 흐름 · 연애 · 관계")
      const label = questionCategory ? `${currentReadingConfig.label} · ${questionCategory}` : currentReadingConfig.label;
      const result = await getTarotReading(q, cards, label);
      setReading(result);
      saveCurrentReading(q, selectedReadingType, cards, result);
    } catch (error) {
      console.error(error);
      setState(ReadingState.ERROR);
    }
  };

  // Full shuffle only on the first pick; later picks morph straight to their slot
  // (Motion layoutId FLIP animation — the fan card becomes the slot card).
  const startPick = (deckIndex: number) => {
    if (state !== ReadingState.DRAWING || revealedCards.length >= targetCardCount) return;
    if (!deckCards.includes(deckIndex)) return;
    pickLockRef.current = true;
    const isMainPhase = revealedCards.length < MAIN_PHASE_COUNT;
    // Reshuffle only when another main-phase pick is coming (the fan stays on screen)
    const reshuffleAfter = isMainPhase && revealedCards.length < MAIN_PHASE_COUNT - 1;

    const commitPick = () => {
      setLiftingCardId(null);
      setDeckCards(prev => prev.filter(id => id !== deckIndex));
      setRevealedCards(prev =>
        prev.length < secretCards.length
          ? [...prev, { ...secretCards[prev.length], deckId: deckIndex }]
          : prev
      );
      // Release the lock after flight + flip (and the background reshuffle) settle.
      setTimeout(() => {
        pickLockRef.current = false;
        const pending = pendingPickRef.current;
        pendingPickRef.current = null;
        if (pending != null) startPickRef.current(pending);
      }, reshuffleAfter ? 1250 : CARD_FLIGHT_MS + 250);
    };

    // The chosen card slides OUT of the fan immediately, then flies to its slot.
    setLiftingCardId(deckIndex);
    playSfx('pick');
    setTimeout(commitPick, 230);

    // The remaining deck riffles separately while the drawn card is on its way.
    if (reshuffleAfter) {
      setTimeout(() => { playSfx('shuffle'); setShufflePhase('split1'); }, 300);
      setTimeout(() => setShufflePhase('merge1'), 540);
      setTimeout(() => setShufflePhase('split2'), 800);
      setTimeout(() => setShufflePhase('merge2'), 1040);
      setTimeout(() => setShufflePhase(null), 1320);
    }
  };

  // Keep a ref to the latest closure so queued picks never act on stale state
  useEffect(() => { startPickRef.current = startPick; });

  const handleCardPick = (deckIndex: number) => {
    if (state !== ReadingState.DRAWING || revealedCards.length >= targetCardCount) return;
    if (pickLockRef.current) {
      // Don't drop clicks made mid-pick — remember the last one and run it next.
      pendingPickRef.current = deckIndex;
      return;
    }
    startPick(deckIndex);
  };

  // Fan geometry: measure container width to derive the arc radius
  useEffect(() => {
    const el = fanRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setFanWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setFanWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [state]);

  const targetCardCount = secretCards.length || READING_TYPES[selectedReadingType].positions.length;
  // 통배열 3장이 공개되고 리딩이 도착하면 결과 표시; 조언 카드는 결과 하단에서 추가로 뽑음
  const showResults = revealedCards.length >= MAIN_PHASE_COUNT && reading !== null;
  const adviceCard = revealedCards[MAIN_PHASE_COUNT];
  const adviceDrawn = revealedCards.length > MAIN_PHASE_COUNT;
  const isSelectingPhase = state === ReadingState.DRAWING && revealedCards.length < MAIN_PHASE_COUNT;
  const currentReadingConfig = READING_TYPES[selectedReadingType];
  const isIdle = state === ReadingState.IDLE;

  const [detailCard, setDetailCard] = useState<{ card: PickedCard; label: string } | null>(null);

  // Deck fan arc geometry, sized to the measured container width
  // chord = 2r·sin(spread/2) must fit the container; height covers the edge drop
  const fanRadius = Math.max(220, Math.min((fanWidth - 80) / 1.64, 520));
  const fanHeight = Math.round(fanRadius * 0.43 + 190);

  const [isExportingShareCard, setIsExportingShareCard] = useState(false);

  const renderInstructionText = () => {
    const count = revealedCards.length;
    const stepLabels = READING_TYPES[selectedReadingType].stepLabels;
    const keyword = stepLabels[count];
    if (!keyword || count >= MAIN_PHASE_COUNT) return null;
    const copy = selectedReadingType === 'flow' ? FLOW_PICK_COPY[count] : null;
    const accent = PHASE_ACCENTS[count];
    return (
      <span className="flex flex-col items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] md:text-xs font-semibold tracking-[0.3em] uppercase backdrop-blur-md ${accent.badge}`}>
          {count + 1} / {MAIN_PHASE_COUNT} · {keyword}
        </span>
        <span key={count} className="text-[#fff7e8] font-display text-2xl md:text-3xl animate-fade-in-up">
          {copy ? copy.title : `카드를 뽑아 ${keyword}의 흐름을 바라보세요`}
        </span>
        {copy && <span className="text-[#cdb682]/85 text-xs md:text-sm tracking-wide">{copy.sub}</span>}
      </span>
    );
  };

  const downloadShareCard = async () => {
    if (!reading || revealedCards.length === 0) return;

    try {
      setIsExportingShareCard(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#05030b');
      gradient.addColorStop(0.55, '#11071d');
      gradient.addColorStop(1, '#1a0d2c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 80; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2.2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(60, 60, canvas.width - 120, canvas.height - 120);

      ctx.strokeStyle = 'rgba(214,179,106,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      ctx.fillStyle = '#f0d48a';
      ctx.font = 'bold 34px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Starot Reading Card', canvas.width / 2, 150);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText('오늘의 리딩', canvas.width / 2, 220);

      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.font = '28px sans-serif';
      const questionText = question.length > 32 ? `${question.slice(0, 32)}...` : question;
      ctx.fillText(questionText, canvas.width / 2, 290);

      // Draw the four drawn cards with their real artwork
      const cardImages = await Promise.all(
        revealedCards.slice(0, 4).map(card => loadImage(getCardImagePath(card)).catch(() => null))
      );

      const cardW = 190;
      const cardH = 316; // ≈ 2:3.33, close to the 1024x1536 source ratio
      const gap = 36;
      const rowW = 4 * cardW + 3 * gap;
      const startX = (canvas.width - rowW) / 2;
      const startY = 350;

      revealedCards.slice(0, 4).forEach((card, index) => {
        const x = startX + index * (cardW + gap);
        const y = startY;
        const img = cardImages[index];

        // Rounded frame + clipped art (reversed cards drawn upside down)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 14);
        ctx.clip();
        if (img) {
          if (card.isReversed) {
            ctx.translate(x + cardW / 2, y + cardH / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
          } else {
            ctx.drawImage(img, x, y, cardW, cardH);
          }
        } else {
          ctx.fillStyle = '#0d0718';
          ctx.fillRect(x, y, cardW, cardH);
        }
        ctx.restore();

        ctx.strokeStyle = 'rgba(214,179,106,0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 14);
        ctx.stroke();

        // Position label + orientation under each card
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d6b36a';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(currentReadingConfig.stepLabels[index] || card.position, x + cardW / 2, y + cardH + 36);
        ctx.fillStyle = card.isReversed ? 'rgba(231,222,248,0.75)' : '#f0d48a';
        ctx.font = '18px sans-serif';
        ctx.fillText(`${card.nameKo.length > 10 ? card.nameKo.slice(0, 10) + '…' : card.nameKo} · ${card.isReversed ? '역방향' : '정방향'}`, x + cardW / 2, y + cardH + 64);
      });

      ctx.fillStyle = '#f0d48a';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('한 줄 조언', 120, 830);

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = 'bold 38px sans-serif';
      wrapCanvasText(ctx, `“${reading.oneLineAdvice}”`, 120, 885, canvas.width - 240, 54, 2);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '26px sans-serif';
      wrapCanvasText(ctx, reading.summary, 120, 1020, canvas.width - 240, 42, 5);

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generated by Starot', canvas.width / 2, 1280);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `starot-reading-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export share card', error);
      alert('공유 카드 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsExportingShareCard(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen relative flex flex-col items-center overflow-x-hidden font-sans">
      <AtelierBackground />
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-[9999] p-3 rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-[#efe7ff] hover:bg-white/15 hover:border-[#d6b36a]/50 transition-all cursor-pointer"
        title={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        )}
      </button>
      <div className={`relative z-10 w-full mx-auto flex flex-col items-center min-h-screen ${isIdle ? '' : 'max-w-6xl p-4 md:p-8'}`}>
        {isIdle ? (
          <LandingScreen
            question={question}
            exampleQuestion={EXAMPLE_QUESTIONS[placeholderIndex]}
            errorMessage={questionError}
            savedReadings={savedReadings}
            selectedCategory={questionCategory}
            onQuestionChange={(value) => { setQuestion(value); if (questionError) setQuestionError(null); }}
            onSelectCategory={setQuestionCategory}
            onStart={handleStart}
            onFillExample={fillQuestionExample}
            onLoadReading={loadSavedReading}
            onDeleteReading={deleteSavedReading}
          />
        ) : (
          <>
            <header className="mt-5 mb-4 z-50 text-center">
              <p className="text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-[#c8b27a]/90 mb-2 animate-fade-in-up">Tarot for modern rituals</p>
              <h1 className="font-display text-4xl md:text-5xl text-[#fff7e8] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Starot
              </h1>
            </header>
          </>
        )}
        {isSelectingPhase && (
          <div className="flex flex-col items-center animate-fade-in-up w-full flex-1 justify-center z-20 relative">
            <h2 className="mb-8 text-center min-h-[3rem] flex items-center justify-center">
              {renderInstructionText()}
            </h2>
            <div ref={fanRef} className="w-full relative" style={{ height: fanHeight }}>
              {deckCards.map((id, index) => {
                const n = deckCards.length;
                const angle = n > 1 ? (index / (n - 1) - 0.5) * FAN_SPREAD_DEG : 0;
                const stackY = fanHeight * 0.16;

                // Riffle shuffle transforms (deck-of-cards technique):
                // split — cards scatter left/right into two loose piles;
                // merge — they slide back through each other with a reshuffled z-order.
                // Outer transform stays translate-only during shuffle (origin-safe);
                // per-card tilt rides on the inner element's independent `rotate`.
                let transform = `translateX(-50%) rotate(${angle.toFixed(2)}deg)`;
                let innerRotate = '0deg';
                let zIndex = index;
                let delayMs = (n - index) * 2;
                if (id === liftingCardId) {
                  // Drawn card slides out of the fan along its own axis before the flight
                  transform = `translateX(-50%) rotate(${angle.toFixed(2)}deg) translateY(-72px) scale(1.08)`;
                  zIndex = 500;
                  delayMs = 0;
                } else if (shufflePhase) {
                  const round = shufflePhase === 'split1' || shufflePhase === 'merge1' ? 1 : 2;
                  const dir = srand(id, round) > 0.5 ? 1 : -1;
                  if (shufflePhase.startsWith('split')) {
                    const dist = 40 + srand(id, round + 10) * 110;
                    const jy = stackY + (srand(id, round + 20) - 0.5) * 36;
                    transform = `translateX(calc(-50% + ${(dir * dist).toFixed(0)}px)) translateY(${jy.toFixed(0)}px)`;
                    innerRotate = `${((srand(id, round + 30) - 0.5) * 26).toFixed(1)}deg`;
                  } else {
                    // merge: collapse into one stack, z-order re-randomized → cards cross over
                    transform = `translateX(-50%) translateY(${stackY.toFixed(0)}px)`;
                    innerRotate = `${((srand(id, round + 40) - 0.5) * 5).toFixed(1)}deg`;
                    zIndex = Math.floor(srand(id, round + 50) * 500);
                  }
                  delayMs = srand(id, round + 60) * 45;
                }

                return (
                  <div
                    key={id}
                    onClick={() => handleCardPick(id)}
                    className={`fan-card absolute left-1/2 top-0 w-16 h-28 md:w-24 md:h-40 group ${isShuffling ? 'cursor-wait' : 'cursor-pointer'}`}
                    style={{
                      zIndex,
                      transform,
                      transformOrigin: `50% ${fanRadius}px`,
                      transitionProperty: 'transform',
                      transitionDuration: id === liftingCardId ? '0.2s' : shufflePhase ? '0.22s' : '0.4s',
                      transitionTimingFunction: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
                      transitionDelay: `${delayMs.toFixed(0)}ms`,
                    }}
                  >
                    <motion.div layoutId={`card-${id}`} className="w-full h-full">
                      <div
                        className="fan-lift w-full h-full"
                        style={{ rotate: innerRotate }}
                      >
                        <div className="w-full h-full rounded-lg border border-[#d6b36a]/25 shadow-xl overflow-hidden bg-[#0d0718] transition-[border-color,box-shadow] duration-200 group-hover:border-[#d6b36a]/80 group-hover:shadow-[0_16px_40px_rgba(214,179,106,0.35)]">
                          <img src={CARD_BACK_PATH} alt="" className="w-full h-full object-cover" draggable={false} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <p className="text-[#cdb682]/70 text-sm mt-8 tracking-wide animate-pulse">
              {isShuffling ? '별의 순서를 다시 섞는 중 ···' : '마음이 이끄는 카드 한 장을 클릭하세요'}
            </p>
          </div>
        )}
        {(state === ReadingState.DRAWING || showResults) && (
          <div className="w-full flex-1 flex flex-col items-center z-20">
             <div className="grid grid-cols-3 gap-3 md:gap-8 mt-4 mb-12 w-full max-w-4xl">
               {Array.from({ length: MAIN_PHASE_COUNT }, (_, index) => {
                  const card = revealedCards[index];
                  return (
                    <div key={index} className="flex flex-col items-center">
                       {!card ? <div className={`w-24 h-40 sm:w-32 sm:h-56 md:w-40 md:h-64 rounded-xl border bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all ${revealedCards.length === index ? `${PHASE_ACCENTS[index].slot} animate-pulse` : 'border-white/10'}`}><span className={`text-xs font-semibold tracking-[0.25em] uppercase ${revealedCards.length === index ? PHASE_ACCENTS[index].label : 'text-[#cdb682]/60'}`}>{currentReadingConfig.stepLabels[index]}</span></div> : <CardDisplay card={card} delay={CARD_FLIGHT_MS} onSelect={() => setDetailCard({ card, label: currentReadingConfig.stepLabels[index] })} />}
                    </div>
                  );
               })}
             </div>
             {revealedCards.length >= MAIN_PHASE_COUNT && !reading && state !== ReadingState.ERROR && <div className="flex flex-col items-center animate-pulse my-8"><div className="w-10 h-10 border-2 border-[#d6b36a] border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-[#e7def8]/85 font-display text-lg tracking-wide">별들이 당신의 운명을 속삭이고 있습니다 ···</p></div>}
             {showResults && reading && (
                <div className="w-full max-w-4xl bg-[linear-gradient(180deg,rgba(16,10,29,0.88),rgba(10,6,18,0.92))] backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.45)] animate-fade-in-up mb-20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d6b36a]/70 to-transparent"></div>
                  <div className="text-center mb-10"><span className="text-[#cdb682] text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase mb-3 block">Your Question</span><h2 className="text-2xl md:text-3xl text-[#fff7e8] font-display leading-tight">"{question}"</h2></div>
                  <div className="grid md:grid-cols-3 gap-x-10 gap-y-8 mb-12">
                    <Section title={currentReadingConfig.sectionTitles[0]} readingContent={reading.pastReading} cardMeaning={reading.pastCardMeaning} />
                    <Section title={currentReadingConfig.sectionTitles[1]} readingContent={reading.presentReading} cardMeaning={reading.presentCardMeaning} />
                    <Section title={currentReadingConfig.sectionTitles[2]} readingContent={reading.futureReading} cardMeaning={reading.futureCardMeaning} />
                  </div>

                  {/* 조언 카드 분기: 통배열 3장의 흐름을 읽은 뒤, 마지막 한 장을 추가로 뽑는다 */}
                  {!adviceDrawn ? (
                    <div className="rounded-[1.4rem] border border-[#d6b36a]/25 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.1),transparent_50%)] p-6 md:p-8 text-center relative overflow-visible">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#d6b36a]/35 bg-white/5 px-4 py-1.5 text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-[#f3d98b]">
                        마지막 한 장 · 조언
                      </span>
                      <h3 className="mt-4 font-display text-xl md:text-2xl text-[#fff7e8]">카드를 뽑아, 지금 필요한 조언을 청해보세요</h3>
                      <p className="mt-2 text-xs md:text-sm text-[#cdb682]/85">세 장의 흐름을 읽었습니다. 별이 건네는 조언 한 장이 남아 있어요.</p>
                      <div className="relative mx-auto mt-6 w-full max-w-md" style={{ height: 175 }}>
                        {deckCards.slice(0, 22).map((id, index, arr) => {
                          const angle = arr.length > 1 ? (index / (arr.length - 1) - 0.5) * 60 : 0;
                          return (
                            <div
                              key={id}
                              onClick={() => handleCardPick(id)}
                              className="fan-card absolute left-1/2 top-0 w-14 h-24 md:w-16 md:h-28 group cursor-pointer"
                              style={{
                                zIndex: id === liftingCardId ? 500 : index,
                                transform: id === liftingCardId
                                  ? `translateX(-50%) rotate(${angle.toFixed(2)}deg) translateY(-56px) scale(1.1)`
                                  : `translateX(-50%) rotate(${angle.toFixed(2)}deg)`,
                                transformOrigin: '50% 240px',
                                transitionProperty: 'transform',
                                transitionDuration: id === liftingCardId ? '0.2s' : '0.4s',
                                transitionTimingFunction: 'cubic-bezier(0.3, 0.8, 0.3, 1)',
                              }}
                            >
                              <motion.div layoutId={`card-${id}`} className="w-full h-full">
                                <div className="fan-lift w-full h-full">
                                  <div className="w-full h-full rounded-lg border border-[#d6b36a]/25 shadow-xl overflow-hidden bg-[#0d0718] transition-[border-color,box-shadow] duration-200 group-hover:border-[#f9a8d4]/70 group-hover:shadow-[0_16px_40px_rgba(249,168,212,0.3)]">
                                    <img src={CARD_BACK_PATH} alt="" className="w-full h-full object-cover" draggable={false} />
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center mb-10">
                        {adviceCard && <CardDisplay card={adviceCard} delay={CARD_FLIGHT_MS} onSelect={() => setDetailCard({ card: adviceCard, label: currentReadingConfig.stepLabels[3] })} />}
                      </div>
                      <div className="mb-12">
                        <Section title={currentReadingConfig.sectionTitles[3]} readingContent={reading.adviceReading} cardMeaning={reading.adviceCardMeaning} />
                      </div>
                      <div className="rounded-[1.4rem] p-6 md:p-8 border border-[#d6b36a]/20 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] relative animate-fade-in-up">
                        <h3 className="text-lg md:text-xl mb-4 flex items-center gap-2 font-display text-[#f0dca4] tracking-wide"><span className="text-[#f0d48a]">✦</span> 종합 해석</h3>
                        <p className="text-[#ece3ff]/95 leading-relaxed mb-6 whitespace-pre-line text-base md:text-lg font-light">{reading.summary}</p>
                        <div className="bg-[#090512]/60 rounded-xl p-4 border-l-2 border-[#d6b36a]"><p className="text-lg font-medium text-[#fff7e8] italic">"{reading.oneLineAdvice}"</p></div>
                        <div className="mt-8 flex justify-end items-center gap-4 flex-wrap border-t border-white/10 pt-4">
                          <button onClick={downloadShareCard} disabled={isExportingShareCard} className="inline-flex items-center gap-2 rounded-full border border-[#f0d48a]/40 bg-[#f1d18a] px-6 py-3 text-sm md:text-base font-semibold text-[#1d1029] shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)] disabled:opacity-60 disabled:cursor-wait">
                            {isExportingShareCard ? '공유 카드 생성 중 ···' : '공유 카드 저장'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="text-center mt-12"><button onClick={() => { setQuestion(''); setQuestionCategory(null); setRevealedCards([]); setReading(null); setSecretCards([]); pickLockRef.current = false; pendingPickRef.current = null; setLiftingCardId(null); setState(ReadingState.IDLE); }} className="text-[#cdb682] hover:text-[#fff7e8] transition-colors border-b border-[#d6b36a]/30 hover:border-[#f0d48a] pb-1 text-xs md:text-sm uppercase tracking-[0.25em]">다른 질문 하기</button></div>
                </div>
             )}
          </div>
        )}
        {state === ReadingState.ERROR && <div className="text-center p-8 rounded-[1.4rem] mt-12 border border-white/12 bg-white/5 backdrop-blur-md max-w-md"><p className="text-[#f3c8c8]">별들의 신호를 수신하는데 실패했습니다.</p><button onClick={() => setState(ReadingState.IDLE)} className="mt-4 text-xs uppercase tracking-[0.25em] text-[#cdb682] hover:text-[#fff7e8] border-b border-[#d6b36a]/30 hover:border-[#f0d48a] pb-1 transition-colors">다시 시도하기</button></div>}
      </div>
      {detailCard && (
        <CardDetailModal
          card={detailCard.card}
          positionLabel={detailCard.label}
          onClose={() => setDetailCard(null)}
        />
      )}
    </div>
    </MotionConfig>
  );
};

const Section: React.FC<{title: string, readingContent: string, cardMeaning: string}> = ({ title, readingContent, cardMeaning }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group flex flex-col h-full">
      <h4 className="text-[#f0dca4] font-semibold mb-3 text-[11px] uppercase tracking-[0.22em] border-l-2 border-[#d6b36a]/60 pl-3 group-hover:border-[#f0d48a] transition-colors">{title}</h4>
      <p className="text-[#ece3ff]/95 text-sm md:text-base leading-7 font-light mb-4 flex-grow font-sans">{readingContent}</p>
      <div className="mt-auto border-t border-white/5 pt-2">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 text-xs text-[#cdb682]/80 hover:text-[#f0d48a] transition-colors focus:outline-none"><span>{isOpen ? '카드 상세 설명 접기' : '카드 상세 설명 보기'}</span><svg className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
        {isOpen && <div className="mt-2 text-xs text-[#c9bfe4]/80 bg-[#090512]/50 p-3 rounded-lg border border-white/5 italic animate-fade-in-up font-sans">{cardMeaning}</div>}
      </div>
    </div>
  );
};

export default App;
