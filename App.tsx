import React, { useState, useRef, useEffect } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { FULL_DECK } from './constants';
import { DrawnCard, ReadingResponse, ReadingState, SavedReading, ReadingPosition } from './types';
import { getTarotReading } from './services/readingService';
import CardDisplay from './components/CardDisplay';
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

const wrapCanvasText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        const remaining = words.slice(n).join(' ');
        const shortened = remaining.length > 38 ? `${remaining.slice(0, 38)}...` : remaining;
        ctx.fillText(shortened, x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
};

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
const FAN_SPREAD_DEG = 90; // total arc angle of the deck fan
const CARD_FLIGHT_MS = 450; // deck → slot layout morph duration (flip starts after this)

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
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [state, setState] = useState<ReadingState>(ReadingState.IDLE);
  const [deckCards, setDeckCards] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [fanWidth, setFanWidth] = useState(0);

  // Pick sequencing: lock while a pick is in progress, queue one click made during the lock
  const pickLockRef = useRef(false);
  const pendingPickRef = useRef<number | null>(null);
  const startPickRef = useRef<(deckIndex: number) => void>(() => {});
  const fanRef = useRef<HTMLDivElement | null>(null);

  // Mute State
  const [isMuted, setIsMuted] = useState(false);

  // Sound Refs
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxStartRef = useRef<HTMLAudioElement | null>(null);
  const sfxPickRef = useRef<HTMLAudioElement | null>(null);
  const sfxShuffleRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Sound Effects
  useEffect(() => {
    bgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-stars-in-the-night-172.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4; 

    sfxStartRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fairy-teleport-868.mp3');
    sfxStartRef.current.volume = 1.0; 

    sfxPickRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-poker-card-flick-2002.mp3');
    sfxPickRef.current.volume = 1.0;

    sfxShuffleRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-card-shuffle-1998.mp3');
    sfxShuffleRef.current.volume = 1.0;

    return () => {
      if(bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) bgmRef.current.muted = isMuted;
    if (sfxStartRef.current) sfxStartRef.current.muted = isMuted;
    if (sfxPickRef.current) sfxPickRef.current.muted = isMuted;
    if (sfxShuffleRef.current) sfxShuffleRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const playSfx = (type: 'start' | 'pick' | 'shuffle') => {
    try {
        if (isMuted) return;
        let audio: HTMLAudioElement | null = null;
        if (type === 'start') audio = sfxStartRef.current;
        if (type === 'pick') audio = sfxPickRef.current;
        if (type === 'shuffle') audio = sfxShuffleRef.current;

        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play prevented:", e));
        }
    } catch (e) {
        console.error("SFX Error", e);
    }
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedReading[];
      if (Array.isArray(parsed)) {
        setSavedReadings(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved readings', error);
    }
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
    setIsShuffling(false);
    setState(ReadingState.DRAWING);
    setDeckCards(Array.from({ length: 78 }, (_, i) => i));
    generateReadingBackground(question, finalCards);
  };

  const generateReadingBackground = async (q: string, cards: DrawnCard[]) => {
    try {
      const result = await getTarotReading(q, cards, currentReadingConfig.label);
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
    const isFirstPick = revealedCards.length === 0;

    const commitPick = () => {
      playSfx('pick');
      setDeckCards(prev => prev.filter(id => id !== deckIndex));
      setRevealedCards(prev =>
        prev.length < secretCards.length
          ? [...prev, { ...secretCards[prev.length], deckId: deckIndex }]
          : prev
      );
      // Release the lock after flight + flip settle, then run a queued click.
      setTimeout(() => {
        pickLockRef.current = false;
        const pending = pendingPickRef.current;
        pendingPickRef.current = null;
        if (pending != null) startPickRef.current(pending);
      }, CARD_FLIGHT_MS + 250);
    };

    if (isFirstPick) {
      setIsShuffling(true);
      playSfx('shuffle');
      setTimeout(() => { setIsShuffling(false); commitPick(); }, 600);
    } else {
      commitPick();
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
  const showResults = revealedCards.length === targetCardCount && reading !== null;
  const isSelectingPhase = state === ReadingState.DRAWING && !showResults;
  const currentReadingConfig = READING_TYPES[selectedReadingType];
  const isIdle = state === ReadingState.IDLE;

  // Deck fan arc geometry, sized to the measured container width
  // chord = 2r·sin(spread/2) must fit the container; height covers the edge drop
  const fanRadius = Math.max(220, Math.min((fanWidth - 90) / 1.41, 460));
  const fanHeight = Math.round(fanRadius * 0.3 + 200);

  const [isExportingShareCard, setIsExportingShareCard] = useState(false);

  const renderInstructionText = () => {
    const count = revealedCards.length;
    const stepLabels = READING_TYPES[selectedReadingType].stepLabels;
    const keyword = stepLabels[count];
    if (!keyword) return null;
    return (
      <span className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d6b36a]/35 bg-white/5 px-4 py-1.5 text-[11px] md:text-xs font-semibold tracking-[0.3em] uppercase text-[#f3d98b] backdrop-blur-md">
          {count + 1} / {stepLabels.length} · {keyword}
        </span>
        <span className="text-[#fff7e8] font-display text-xl md:text-2xl">흐름을 짚어볼 카드를 선택하세요</span>
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

      const cardBoxWidth = 210;
      const cardBoxHeight = 140;
      const gap = 20;
      const startX = (canvas.width - (2 * cardBoxWidth + gap)) / 2;
      const startY = 360;

      revealedCards.slice(0, 4).forEach((card, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = startX + col * (cardBoxWidth + gap);
        const y = startY + row * (cardBoxHeight + gap);

        ctx.fillStyle = 'rgba(13,7,24,0.6)';
        ctx.fillRect(x, y, cardBoxWidth, cardBoxHeight);
        ctx.strokeStyle = 'rgba(214,179,106,0.4)';
        ctx.strokeRect(x, y, cardBoxWidth, cardBoxHeight);

        ctx.fillStyle = '#d6b36a';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(currentReadingConfig.stepLabels[index] || card.position, x + 16, y + 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        const cardTitle = card.nameKo.length > 12 ? `${card.nameKo.slice(0, 12)}...` : card.nameKo;
        ctx.fillText(cardTitle, x + 16, y + 68);

        ctx.fillStyle = card.isReversed ? 'rgba(231,222,248,0.75)' : '#f0d48a';
        ctx.font = '18px sans-serif';
        ctx.fillText(card.isReversed ? '역방향' : '정방향', x + 16, y + 104);
      });

      ctx.fillStyle = '#f0d48a';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('한 줄 조언', 120, 735);

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = 'bold 42px sans-serif';
      wrapCanvasText(ctx, `“${reading.oneLineAdvice}”`, 120, 790, canvas.width - 240, 58);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '26px sans-serif';
      wrapCanvasText(ctx, reading.summary, 120, 980, canvas.width - 240, 42, 5);

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generated by Starot', canvas.width / 2, 1260);

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
            onQuestionChange={(value) => { setQuestion(value); if (questionError) setQuestionError(null); }}
            onStart={handleStart}
            onFillExample={fillQuestionExample}
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
        {isSelectingPhase && revealedCards.length < targetCardCount && (
          <div className="flex flex-col items-center animate-fade-in-up w-full flex-1 justify-center z-20 relative">
            {isShuffling && <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="border border-[#d6b36a]/35 bg-[#0b0616]/85 backdrop-blur-md px-8 py-4 rounded-full shadow-[0_0_40px_rgba(214,179,106,0.25)] animate-pulse"><span className="text-[#f6e8bf] font-display tracking-[0.35em] text-lg md:text-xl">셔플 중 ···</span></div></div>}
            <h2 className="mb-10 text-center min-h-[3rem] flex items-center justify-center">
              {renderInstructionText()}
            </h2>
            <div ref={fanRef} className="w-full relative" style={{ height: fanHeight }}>
              {deckCards.map((id, index) => {
                const n = deckCards.length;
                const angle = n > 1 ? (index / (n - 1) - 0.5) * FAN_SPREAD_DEG : 0;
                return (
                  <div
                    key={id}
                    onClick={() => handleCardPick(id)}
                    className={`absolute left-1/2 top-0 w-16 h-28 md:w-24 md:h-40 group ${isShuffling ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      zIndex: index,
                      transform: `translateX(-50%) rotate(${angle.toFixed(2)}deg)`,
                      transformOrigin: `50% ${fanRadius}px`,
                      transition: 'transform 0.45s cubic-bezier(0.25, 0.8, 0.3, 1)',
                    }}
                  >
                    <motion.div layoutId={`card-${id}`} className="w-full h-full">
                      <div className={`w-full h-full rounded-lg border border-[#d6b36a]/25 shadow-xl overflow-hidden bg-[#0d0718] transition-all duration-300 group-hover:-translate-y-3 group-hover:border-[#d6b36a]/70 group-hover:shadow-[0_12px_32px_rgba(214,179,106,0.28)] ${isShuffling ? 'animate-shuffle-shake opacity-60 blur-[2px] brightness-75' : ''}`}>
                        <img src="/cards/back.png" alt="" className="w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-125" draggable={false} />
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <p className="text-[#cdb682]/70 text-sm mt-8 tracking-wide animate-pulse">카드를 클릭하여 운명을 확인하세요</p>
          </div>
        )}
        {(state === ReadingState.DRAWING || showResults) && (
          <div className="w-full flex-1 flex flex-col items-center z-20">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-4 mb-12 w-full max-w-5xl">
               {[0, 1, 2, 3].map((index) => {
                  const card = revealedCards[index];
                  return (
                    <div key={index} className="flex flex-col items-center">
                       {!card ? <div className={`w-32 h-56 md:w-40 md:h-64 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all ${revealedCards.length === index ? 'border-[#d6b36a]/50 shadow-[0_0_24px_rgba(214,179,106,0.14)] animate-pulse' : ''}`}><span className="text-[#cdb682]/60 text-xs font-semibold tracking-[0.25em] uppercase">{currentReadingConfig.stepLabels[index]}</span></div> : <CardDisplay card={card} delay={CARD_FLIGHT_MS} />}
                    </div>
                  );
               })}
             </div>
             {revealedCards.length === targetCardCount && !showResults && <div className="flex flex-col items-center animate-pulse my-8"><div className="w-10 h-10 border-2 border-[#d6b36a] border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-[#e7def8]/85 font-display text-lg tracking-wide">별들이 당신의 운명을 속삭이고 있습니다 ···</p></div>}
             {showResults && reading && (
                <div className="w-full max-w-4xl bg-[linear-gradient(180deg,rgba(16,10,29,0.88),rgba(10,6,18,0.92))] backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.45)] animate-fade-in-up mb-20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d6b36a]/70 to-transparent"></div>
                  <div className="text-center mb-10"><span className="text-[#cdb682] text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase mb-3 block">Your Question</span><h2 className="text-2xl md:text-3xl text-[#fff7e8] font-display leading-tight">"{question}"</h2></div>
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                    <Section title={currentReadingConfig.sectionTitles[0]} readingContent={reading.pastReading} cardMeaning={reading.pastCardMeaning} />
                    <Section title={currentReadingConfig.sectionTitles[1]} readingContent={reading.presentReading} cardMeaning={reading.presentCardMeaning} />
                    <Section title={currentReadingConfig.sectionTitles[2]} readingContent={reading.futureReading} cardMeaning={reading.futureCardMeaning} />
                    <Section title={currentReadingConfig.sectionTitles[3]} readingContent={reading.adviceReading} cardMeaning={reading.adviceCardMeaning} />
                  </div>
                  <div className="rounded-[1.4rem] p-6 md:p-8 border border-[#d6b36a]/20 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] relative">
                    <h3 className="text-lg md:text-xl mb-4 flex items-center gap-2 font-display text-[#f0dca4] tracking-wide"><span className="text-[#f0d48a]">✦</span> 종합 해석</h3>
                    <p className="text-[#ece3ff]/95 leading-relaxed mb-6 whitespace-pre-line text-base md:text-lg font-light">{reading.summary}</p>
                    <div className="bg-[#090512]/60 rounded-xl p-4 border-l-2 border-[#d6b36a]"><p className="text-lg font-medium text-[#fff7e8] italic">"{reading.oneLineAdvice}"</p></div>
                    <div className="mt-8 flex justify-end items-center gap-4 flex-wrap border-t border-white/10 pt-4">
                      <button onClick={downloadShareCard} disabled={isExportingShareCard} className="inline-flex items-center gap-2 rounded-full border border-[#f0d48a]/40 bg-[#f1d18a] px-6 py-3 text-sm md:text-base font-semibold text-[#1d1029] shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)] disabled:opacity-60 disabled:cursor-wait">
                        {isExportingShareCard ? '공유 카드 생성 중 ···' : '공유 카드 저장'}
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-12"><button onClick={() => { setQuestion(''); setRevealedCards([]); setReading(null); setSecretCards([]); pickLockRef.current = false; pendingPickRef.current = null; setState(ReadingState.IDLE); }} className="text-[#cdb682] hover:text-[#fff7e8] transition-colors border-b border-[#d6b36a]/30 hover:border-[#f0d48a] pb-1 text-xs md:text-sm uppercase tracking-[0.25em]">다른 질문 하기</button></div>
                </div>
             )}
          </div>
        )}
        {state === ReadingState.ERROR && <div className="text-center p-8 rounded-[1.4rem] mt-12 border border-white/12 bg-white/5 backdrop-blur-md max-w-md"><p className="text-[#f3c8c8]">별들의 신호를 수신하는데 실패했습니다.</p><button onClick={() => setState(ReadingState.IDLE)} className="mt-4 text-xs uppercase tracking-[0.25em] text-[#cdb682] hover:text-[#fff7e8] border-b border-[#d6b36a]/30 hover:border-[#f0d48a] pb-1 transition-colors">다시 시도하기</button></div>}
      </div>
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
