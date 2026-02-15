import React, { useState, useRef, useEffect } from 'react';
import { FULL_DECK } from './constants';
import { DrawnCard, ReadingResponse, ReadingState } from './types';
import { getTarotReading, getTarotSpeech, decodeBase64, decodeAudioData } from './services/geminiService';
import CardDisplay from './components/CardDisplay';

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

// Custom animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInPlaceholder {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1); }
    50% { box-shadow: 0 0 80px rgba(168, 85, 247, 0.7), inset 0 0 50px rgba(216, 180, 254, 0.3); }
  }
  @keyframes mist-swirl {
    0% { transform: rotate(0deg) scale(1.5); opacity: 0; }
    50% { opacity: 0.8; }
    100% { transform: rotate(120deg) scale(1.5); opacity: 0; }
  }
  @keyframes shuffle-shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  .animate-fade-out {
    animation: fadeOut 0.5s ease-out forwards;
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  .animate-placeholder {
    animation: fadeInPlaceholder 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .animate-pulse-glow {
    animation: pulse-glow 4s infinite ease-in-out;
  }
  .animate-mist {
    animation: mist-swirl 8s infinite linear;
  }
  .animate-shuffle-shake {
    animation: shuffle-shake 0.1s linear infinite;
  }
  /* Hide scrollbar for deck spread */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Background Stars Component
const BackgroundStars = () => {
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3}px`,
    delay: `${Math.random() * 5}s`,
    duration: `${2 + Math.random() * 3}s`
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#2a1b4e] to-[#1a103c]"></div>
      {stars.map((star, i) => (
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
      <div className="shooting-star" style={{ top: '5%', left: '50%', animationDelay: '12s' }}></div>
    </div>
  );
};

const App: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [secretCards, setSecretCards] = useState<DrawnCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [state, setState] = useState<ReadingState>(ReadingState.IDLE);
  const [deckCards, setDeckCards] = useState<number[]>([]); 
  const [isShuffling, setIsShuffling] = useState(false);

  // Audio State
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const activeSource = useRef<AudioBufferSourceNode | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

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

  const initAudio = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(ctx);
      return ctx;
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  };

  const stopAudio = () => {
    if (activeSource.current) {
      try { activeSource.current.stop(); } catch (e) { /* ignore */ }
      activeSource.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    pauseTimeRef.current = 0;
  };

  const pauseAudio = () => {
    if (activeSource.current && isPlaying) {
      try {
        activeSource.current.stop();
        if (audioContext) {
          pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
        }
      } catch (e) { /* ignore */ }
      setIsPlaying(false);
      setIsPaused(true);
      activeSource.current = null;
    }
  };

  const resumeAudio = () => {
    if (audioBuffer && audioContext && isPaused) {
      playAudioBuffer(audioBuffer, audioContext, pauseTimeRef.current);
      setIsPaused(false);
    }
  };

  const handleStart = () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }
    playSfx('start');
    playBgm();
    stopAudio();
    setAudioBuffer(null);
    initAudio();

    const shuffled = [...FULL_DECK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    const positions: ('past' | 'present' | 'future' | 'advice')[] = ['past', 'present', 'future', 'advice'];
    const finalCards: DrawnCard[] = selected.map((card, index) => ({
      ...card,
      isReversed: Math.random() < 0.3, 
      position: positions[index]
    }));

    setSecretCards(finalCards);
    setRevealedCards([]);
    setReading(null);
    setState(ReadingState.DRAWING); 
    setDeckCards(Array.from({ length: 78 }, (_, i) => i));
    generateReadingBackground(question, finalCards);
  };

  const generateReadingBackground = async (q: string, cards: DrawnCard[]) => {
    try {
      const result = await getTarotReading(q, cards);
      setReading(result);
      generateAudioBackground(result);
    } catch (error) {
      console.error(error);
      setState(ReadingState.ERROR);
    }
  };

  const generateAudioBackground = async (result: ReadingResponse) => {
    setIsAudioLoading(true);
    const textToRead = `종합 해석입니다. ${result.summary} 조언을 드리자면. ${result.oneLineAdvice}`;
    try {
      const base64Audio = await getTarotSpeech(textToRead);
      const ctx = initAudio();
      const bytes = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
      setAudioBuffer(buffer);
    } catch (error) {
      console.error("Audio generation failed", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleCardPick = (deckIndex: number) => {
    if (revealedCards.length >= 4 || isShuffling) return;
    setIsShuffling(true);
    playSfx('shuffle');
    setTimeout(() => {
        const nextCard = secretCards[revealedCards.length];
        setRevealedCards(prev => [...prev, nextCard]);
        setDeckCards(prev => prev.filter(id => id !== deckIndex));
        playSfx('pick');
        setTimeout(() => {
            setIsShuffling(false);
        }, 100); 
    }, 600); 
  };

  const playAudioBuffer = (buffer: AudioBuffer | null, ctx: AudioContext | null, offset: number = 0) => {
    if (!buffer || !ctx) return;
    if (activeSource.current) {
      try { activeSource.current.stop(); } catch(e){}
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => { setIsPlaying(false); };
    activeSource.current = source;
    startTimeRef.current = ctx.currentTime - offset;
    source.start(0, offset);
    setIsPlaying(true);
  };

  const handlePlayOrResume = () => {
    if (isPlaying) return;
    if (isPaused && audioBuffer) {
      resumeAudio();
    } else {
      const ctx = initAudio();
      playAudioBuffer(audioBuffer, ctx, 0);
    }
  };

  const showResults = revealedCards.length === 4 && reading !== null;
  const isSelectingPhase = state === ReadingState.DRAWING && !showResults;
  const isIdle = state === ReadingState.IDLE;

  const [showAudioModal, setShowAudioModal] = useState(false);
  useEffect(() => {
    if (showResults && audioBuffer && !isAudioLoading && !isPlaying && !isPaused && !showAudioModal) {
        const timer = setTimeout(() => setShowAudioModal(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [showResults, audioBuffer, isAudioLoading]);

  const renderInstructionText = () => {
    const count = revealedCards.length;
    let keyword = "";
    let colorClass = "";
    switch (count) {
      case 0: keyword = "과거"; colorClass = "text-yellow-300"; break;
      case 1: keyword = "현재"; colorClass = "text-blue-300"; break;
      case 2: keyword = "미래"; colorClass = "text-purple-300"; break;
      case 3: keyword = "조언"; colorClass = "text-pink-300"; break;
      default: return null;
    }
    return (
      <span className="flex items-center gap-2">
        <span className={`font-bold text-2xl md:text-3xl ${colorClass} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse`}>
          [{keyword}]
        </span>
        <span className="text-white opacity-100 font-medium text-lg md:text-xl drop-shadow-md">흐름을 짚어볼 카드를 선택하세요</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-x-hidden font-sans">
      <style>{animationStyles}</style>
      <BackgroundStars />
      <button 
        onClick={toggleMute}
        className="fixed top-6 left-6 z-[9999] p-3 rounded-full bg-slate-800 border-2 border-white/30 hover:border-white text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-110 transition-all cursor-pointer"
        title={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        )}
      </button>
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center min-h-screen p-4 md:p-8">
        <header className={`transition-all duration-700 z-50 ${isIdle ? 'mt-8 mb-4' : 'mt-4 mb-4 scale-90'}`}>
           <div className="bg-purple-600/30 backdrop-blur-md border border-purple-400/30 rounded-full px-6 py-1 shadow-lg inline-block mb-3 animate-fade-in-up mx-auto block w-fit">
             <p className="text-yellow-200 font-bold text-xs md:text-sm tracking-widest drop-shadow-md text-center">별처럼 빛나는 당신의 미래를 위한</p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white font-extrabold text-center tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
             <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-yellow-100 to-white drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">Starot</span>
          </h1>
        </header>
        {isIdle && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg animate-fade-in-up relative mt-[-2rem]" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto z-0 mb-32">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[120%] bg-purple-900/30 blur-[80px] rounded-full"></div>
               <div className="w-full h-full relative z-10">
                  <img src="https://t3.ftcdn.net/jpg/15/95/33/70/360_F_1595337051_LmxrBVt0mw106obPtaBdKyFMYbXEh4k1.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1572916124578-8314120df0f8?q=80&w=1000&auto=format&fit=crop"; }} alt="Mystic Fortune Teller" className="w-full h-full object-cover rounded-t-[5rem] rounded-b-[8rem] opacity-90 shadow-[0_20px_60px_rgba(0,0,0,0.6)]" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} />
               </div>
                
                {/* Input Layer (Moved Down) */}
                <div className="absolute bottom-16 left-0 right-0 z-30 px-6">
                  <div className="relative group max-w-xs mx-auto transform transition-transform duration-500 hover:scale-105">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-80 transition duration-500"></div>
                    <div className="relative bg-slate-900/40 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-transparent text-white px-8 py-3 text-center text-sm md:text-base focus:outline-none placeholder-transparent font-medium drop-shadow-md font-sans" onKeyDown={(e) => e.key === 'Enter' && handleStart()} />
                        {!question && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span key={placeholderIndex} className="text-purple-100/70 animate-placeholder text-xs md:text-sm font-light tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{EXAMPLE_QUESTIONS[placeholderIndex]}</span></div>}
                    </div>
                  </div>
                </div>

               {/* Start Button (Moved Up) */}
               <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-40" onClick={handleStart}>
                  <div className="relative group cursor-pointer w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                      <div className="absolute inset-2 bg-purple-600/30 blur-3xl rounded-full animate-pulse-glow pointer-events-none"></div>
                      <button className="relative w-full h-full rounded-full border border-white/10 overflow-hidden transition-transform duration-500 group-hover:scale-105 active:scale-95" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(216, 180, 254, 0.5) 25%, rgba(107, 33, 168, 0.8) 60%, rgba(15, 23, 42, 0.98) 100%)', boxShadow: '0 0 60px rgba(168, 85, 247, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.25)' }}>
                          <div className="absolute top-8 left-10 w-16 h-8 bg-white/40 blur-xl rounded-full transform -rotate-45 pointer-events-none"></div>
                          <div className="absolute bottom-6 right-10 w-12 h-6 bg-purple-400/20 blur-lg rounded-full pointer-events-none"></div>
                          <div className="absolute inset-0 opacity-70 mix-blend-color-dodge pointer-events-none"><div className="absolute w-full h-full bg-gradient-to-r from-transparent via-purple-300/20 to-transparent animate-mist blur-2xl"></div><div className="absolute w-full h-full bg-gradient-to-b from-transparent via-pink-300/10 to-transparent animate-mist blur-2xl" style={{ animationDelay: '-4s' }}></div></div>
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 rounded-full border border-purple-200/40 animate-spin-slow blur-[1px]"></div>
                          <div className="relative z-10 flex flex-col items-center mt-4"><span className="text-2xl md:text-3xl font-display font-bold text-white tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-yellow-100 transition-colors duration-300">START</span><span className="text-[10px] md:text-xs text-purple-100/70 mt-1 font-light tracking-widest uppercase border-t border-purple-400/30 pt-1">운명 확인하기</span></div>
                      </button>
                      <div className="absolute -bottom-6 w-32 h-6 bg-black/60 blur-xl rounded-[100%] pointer-events-none"></div>
                  </div>
               </div>
            </div>
          </div>
        )}
        {isSelectingPhase && revealedCards.length < 4 && (
          <div className="flex flex-col items-center animate-fade-in-up w-full flex-1 justify-center z-20 relative">
            {isShuffling && <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-full border border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.6)] animate-pulse"><span className="text-white font-display font-bold tracking-widest text-xl md:text-2xl drop-shadow-lg">🔮 셔플 중...</span></div></div>}
            {/* Fixed Text Visibility: Removed text-transparent and bg-clip-text */}
            <h2 className="text-xl md:text-3xl text-white mb-12 font-display text-center drop-shadow-lg min-h-[3rem] flex items-center justify-center">
              {renderInstructionText()}
            </h2>
            <div className="w-full overflow-x-auto no-scrollbar py-10 px-4">
              <div className="flex justify-center min-w-max px-10 perspective-1000 transition-all duration-500">
                 {deckCards.map((id, index) => {
                   const cardClass = isShuffling ? "-ml-14 md:-ml-20 scale-90 animate-shuffle-shake cursor-not-allowed opacity-60 blur-[2px] brightness-75" : "-ml-8 md:-ml-12 hover:-translate-y-12 hover:scale-110 hover:rotate-3 hover:z-50 cursor-pointer";
                   return (
                     <div key={id} onClick={() => !isShuffling && handleCardPick(id)} className={`relative w-16 h-28 md:w-24 md:h-40 first:ml-0 transition-all duration-500 ease-out group transform-gpu ${cardClass}`} style={{ zIndex: index }}>
                       <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-purple-400/40 shadow-xl group-hover:shadow-purple-500/60 overflow-hidden"><div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div><div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full border border-purple-300/20 group-hover:border-purple-300/60 transition-colors"></div></div></div>
                     </div>
                   );
                 })}
              </div>
            </div>
            <p className="text-purple-300/60 text-sm mt-8 animate-pulse">카드를 클릭하여 운명을 확인하세요</p>
          </div>
        )}
        {(state === ReadingState.DRAWING || showResults) && (
          <div className="w-full flex-1 flex flex-col items-center z-20">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-4 mb-12 w-full max-w-5xl">
               {[0, 1, 2, 3].map((index) => {
                  const card = revealedCards[index];
                  return (
                    <div key={index} className="flex flex-col items-center">
                       {!card ? <div className={`w-32 h-56 md:w-40 md:h-64 rounded-xl border-2 border-dashed border-purple-500/20 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all ${revealedCards.length === index ? 'animate-pulse border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : ''}`}><span className="text-purple-400/50 text-sm font-bold tracking-widest">{['과거', '현재', '미래', '조언'][index]}</span></div> : <CardDisplay card={card} delay={index * 200} />}
                    </div>
                  );
               })}
             </div>
             {revealedCards.length === 4 && !showResults && <div className="flex flex-col items-center animate-pulse my-8"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-purple-200 font-display text-lg">별들이 당신의 운명을 속삭이고 있습니다...</p></div>}
             {showResults && reading && (
                <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-purple-500/30 shadow-[0_0_50px_rgba(76,29,149,0.3)] animate-fade-in-up mb-20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                  <div className="text-center mb-10"><span className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-2 block">Your Question</span><h2 className="text-2xl md:text-3xl text-white font-display leading-tight">"{question}"</h2></div>
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                    <Section title="과거 (Past)" readingContent={reading.pastReading} cardMeaning={reading.pastCardMeaning} />
                    <Section title="현재 (Present)" readingContent={reading.presentReading} cardMeaning={reading.presentCardMeaning} />
                    <Section title="미래 (Future)" readingContent={reading.futureReading} cardMeaning={reading.futureCardMeaning} />
                    <Section title="조언 (Advice)" readingContent={reading.adviceReading} cardMeaning={reading.adviceCardMeaning} />
                  </div>
                  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 md:p-8 border border-white/10 relative">
                    <h3 className="text-xl font-bold text-yellow-200 mb-4 flex items-center gap-2"><span>✨</span> 종합 해석</h3>
                    <p className="text-gray-100 leading-relaxed mb-6 whitespace-pre-line text-lg font-light">{reading.summary}</p>
                    <div className="bg-black/20 rounded-xl p-4 border-l-4 border-yellow-400"><p className="text-lg font-medium text-white italic">"{reading.oneLineAdvice}"</p></div>
                    <div className="mt-8 flex justify-end items-center gap-4 flex-wrap border-t border-white/10 pt-4">
                      {isAudioLoading && <span className="text-sm text-purple-300 animate-pulse">신비로운 목소리를 준비 중...</span>}
                      {audioBuffer && (
                        <>
                          {!isPlaying ? (
                            <button onClick={handlePlayOrResume} className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5"><span className="text-xl">🔊</span> {isPaused ? '이어 듣기' : '목소리로 듣기'}</button>
                          ) : (
                            <button onClick={pauseAudio} className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all shadow-lg border border-white/10"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>일시정지</button>
                          )}
                          {(isPlaying || isPaused) && <button onClick={stopAudio} className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-2">그만 듣기</button>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-center mt-12"><button onClick={() => { setQuestion(''); setRevealedCards([]); setReading(null); setSecretCards([]); setState(ReadingState.IDLE); stopAudio(); }} className="text-purple-300 hover:text-white transition-colors border-b border-purple-500/30 hover:border-purple-300 pb-1 text-sm uppercase tracking-widest">다른 질문 하기</button></div>
                </div>
             )}
          </div>
        )}
        {state === ReadingState.ERROR && <div className="text-center text-red-300 bg-red-900/20 p-6 rounded-xl mt-8 border border-red-500/30 backdrop-blur-md"><p>별들의 신호를 수신하는데 실패했습니다.</p><button onClick={() => setState(ReadingState.IDLE)} className="mt-4 text-sm underline">다시 시도하기</button></div>}
      </div>
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-[#1a103c] border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(139,92,246,0.3)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
                <h3 className="text-2xl font-display text-yellow-200 mb-4 relative z-10">운명의 목소리</h3>
                <p className="text-gray-300 mb-8 relative z-10 leading-relaxed">AI가 해석한 당신의 운명을<br/>신비로운 목소리로 들려드릴까요?</p>
                <div className="flex justify-center gap-4 relative z-10"><button onClick={() => setShowAudioModal(false)} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition-colors">아니오</button><button onClick={() => { setShowAudioModal(false); handlePlayOrResume(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg transition-transform transform hover:scale-105">네, 들을래요</button></div>
            </div>
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{title: string, readingContent: string, cardMeaning: string}> = ({ title, readingContent, cardMeaning }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group flex flex-col h-full">
      <h4 className="text-purple-300 font-bold mb-3 text-xs uppercase tracking-widest border-l-2 border-purple-500 pl-3 group-hover:border-yellow-400 transition-colors">{title}</h4>
      <p className="text-gray-100 text-sm md:text-base leading-7 font-light mb-4 flex-grow font-sans">{readingContent}</p>
      <div className="mt-auto border-t border-white/5 pt-2">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 text-xs text-purple-400/70 hover:text-purple-300 transition-colors focus:outline-none"><span>{isOpen ? '카드 상세 설명 접기' : '카드 상세 설명 보기'}</span><svg className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
        {isOpen && <div className="mt-2 text-xs text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5 italic animate-fade-in-up font-sans">{cardMeaning}</div>}
      </div>
    </div>
  );
};

export default App;
