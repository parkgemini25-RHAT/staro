import React, { useEffect, useRef, useState } from 'react';
import { SavedReading } from '../types';
import { DECKS } from '../utils/cardAssets';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_COPY } from '../constants/themeCopy';

// 상용 타로 서비스 공통 패턴: 카테고리로 질문 진입장벽 낮추기
const QUESTION_CATEGORIES = [
  { label: '연애 · 관계', question: '지금 이 관계는 어떤 흐름으로 가고 있나요?' },
  { label: '일 · 커리어', question: '지금 하고 있는 일은 어디로 향하고 있나요?' },
  { label: '금전 · 재물', question: '다가오는 금전 흐름은 어떤 모습인가요?' },
  { label: '선택 · 결정', question: '지금 고민하는 선택, 어느 쪽이 더 좋은 흐름인가요?' },
];

interface LandingScreenProps {
  question: string;
  exampleQuestion: string;
  errorMessage?: string | null;
  savedReadings?: SavedReading[];
  selectedCategory?: string | null;
  onQuestionChange: (value: string) => void;
  onSelectCategory?: (label: string) => void;
  onStart: () => void;
  onFillExample: () => void;
  onLoadReading?: (item: SavedReading) => void;
  onDeleteReading?: (id: string) => void;
}

const formatSavedDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const LandingScreen: React.FC<LandingScreenProps> = ({
  question,
  exampleQuestion,
  errorMessage,
  savedReadings = [],
  selectedCategory,
  onQuestionChange,
  onSelectCategory,
  onStart,
  onFillExample,
  onLoadReading,
  onDeleteReading,
}) => {
  const { theme } = useTheme();
  // 3D 주사위: 면별 목표 회전(rotateX/rotateY) + 누적 스핀으로 굴림 연출
  const DIE_FACE_ROT: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 0 }, 2: { x: -90, y: 0 }, 3: { x: 0, y: -90 },
    4: { x: 0, y: 90 }, 5: { x: 90, y: 0 }, 6: { x: 0, y: 180 },
  };
  const [dieRot, setDieRot] = useState({ x: -22, y: 32, turns: 0 });
  const rollDie = () => {
    const face = 1 + Math.floor(Math.random() * 6);
    const target = DIE_FACE_ROT[face];
    setDieRot(prev => ({
      x: target.x + 360 * (prev.turns + 1),
      y: target.y + 360 * (prev.turns + 1),
      turns: prev.turns + 1,
    }));
    // 굴러가는 중간에 질문이 바뀐다
    setTimeout(onFillExample, 320);
  };
  const copy = THEME_COPY[theme];
  const deckDir = DECKS[theme].dir;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-grow: start compact (2 rows), expand with content up to a cap
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [question]);
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-start sm:items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="order-1 animate-fade-in-up lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-glass/5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-accent-soft backdrop-blur-md sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.28em]">
              {copy.heroBadge}
            </div>

            <div className="mt-4 max-w-3xl sm:mt-6">
              <p className="text-[10px] tracking-[0.24em] text-accent-muted/90 uppercase sm:text-sm sm:tracking-[0.45em]">
                {copy.heroTagline}
              </p>
              <h1 className="mt-3 font-display text-[2.25rem] leading-[0.95] text-ink-hi sm:mt-5 sm:text-6xl lg:text-7xl">
                {copy.brandName},
                <br />
                <span className="text-[2rem] text-accent sm:text-inherit">{copy.heroTitleAccent}</span>
              </h1>
              <p className="mt-4 max-w-xl text-[14px] leading-6 text-ink/82 sm:mt-6 sm:text-lg sm:leading-7">
                {copy.heroDesc}
              </p>
            </div>

            {/* 질문 카드 — 설명 블록 없이 입력이 바로 첫 시선에 오도록 슬림화 */}
            <div className="mt-6 max-w-xl rounded-[1.4rem] border border-line/12 bg-glass/6 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-8 sm:rounded-[1.8rem] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[9px] uppercase tracking-[0.18em] text-accent-muted sm:text-xs sm:tracking-[0.24em]">
                  질문 입력
                </label>
                <span className="rounded-full border border-line/12 px-3 py-1 text-[9px] text-accent-soft sm:text-[10px]">
                  종합 리딩 3장 + 조언 1장
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {QUESTION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => {
                      // 칩마다 정해진 질문을 항상 채운다 (재클릭 = 해당 카테고리 질문으로 교체)
                      onSelectCategory?.(cat.label);
                      onQuestionChange(cat.question);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[11px] transition sm:text-xs ${selectedCategory === cat.label ? 'border-accent-hi/60 bg-accent-hi/15 text-accent-soft' : 'border-line/12 bg-glass/5 text-ink hover:border-accent/40 hover:text-accent-soft'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-[1.1rem] border border-line/10 bg-surface-deep/70 p-3 sm:rounded-[1.4rem] sm:p-4">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={exampleQuestion}
                  rows={2}
                  className="min-h-[52px] w-full resize-none bg-transparent text-[14px] leading-6 text-ink-hi outline-none placeholder:text-ink-faint sm:text-base sm:leading-7"
                />
                {isFocused && !errorMessage && (
                  <p className="mt-1.5 text-[11px] leading-4 text-accent-muted/75 sm:text-xs animate-fade-in-up">
                    팁 · 예/아니오보다, 지금 어떤 상황이고 앞으로 어떻게 될 지 묻는 질문이 더 잘 맞아요.
                  </p>
                )}
                {errorMessage && (
                  <p className="mt-1.5 text-[12px] leading-5 text-[#f3c8c8] sm:text-sm animate-fade-in-up">
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 sm:gap-3">
                <button
                  onClick={rollDie}
                  aria-label="주사위를 굴려 랜덤 질문 넣기"
                  title="주사위를 굴려 랜덤 질문 넣기"
                  className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-line/12 bg-glass/6 transition hover:border-accent/40 hover:bg-glass/10 sm:h-[52px] sm:w-[52px]"
                >
                  <span className="die-scene">
                    <span
                      className="die block"
                      style={{ transform: `rotateX(${dieRot.x}deg) rotateY(${dieRot.y}deg)` }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(f => <span key={f} className={`die__face die__face--${f}`} />)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={onStart}
                  className={`group relative inline-flex min-h-[50px] flex-1 items-center justify-center overflow-hidden rounded-full border border-accent-hi/40 px-6 py-3 text-[15px] font-semibold text-cta-ink shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)] sm:min-h-[52px] sm:text-base ${question.trim() ? 'bg-cta' : 'bg-cta/55'}`}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                  리딩 시작하기
                </button>
              </div>
            </div>

            {savedReadings.length > 0 && (
              <div className="mt-5 max-w-xl rounded-[1.4rem] border border-line/12 bg-glass/6 p-3 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-accent-muted sm:text-xs sm:tracking-[0.24em]">
                  <span>지난 리딩</span>
                  <span className="rounded-full border border-line/12 px-3 py-1 text-[9px] text-accent-soft sm:text-[10px]">{savedReadings.length}</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {savedReadings.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onLoadReading?.(item)}
                        className="group flex w-full items-center gap-3 rounded-[1rem] border border-line/10 bg-surface-deep/55 px-3.5 py-3 text-left transition hover:border-accent/45 hover:bg-surface/80"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] leading-5 text-ink-hi sm:text-sm">{item.question}</p>
                          <p className="mt-0.5 text-[10px] tracking-[0.12em] text-accent-muted/80 sm:text-[11px]">
                            {formatSavedDate(item.createdAt)} · {item.cards.slice(0, 2).map(c => c.name).join(', ')} 외 {Math.max(item.cards.length - 2, 0)}장
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-accent-muted/70 transition group-hover:text-accent-hi">보기</span>
                        <span
                          role="button"
                          aria-label="리딩 삭제"
                          onClick={(e) => { e.stopPropagation(); onDeleteReading?.(item.id); }}
                          className="shrink-0 rounded-full border border-line/10 px-2 py-0.5 text-[11px] text-ink-faint transition hover:border-[#e07a7a]/40 hover:text-[#f3c8c8]"
                        >
                          ✕
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="order-2 animate-fade-in-up [animation-delay:160ms] [animation-fill-mode:both] lg:order-2">
            <div className="relative mx-auto max-w-[24rem] sm:max-w-[28rem]">
              {/* 카드 쇼케이스 — 실제 78장 덱의 메이저 아르카나 3장 */}
              <div className="relative h-[17rem] sm:h-[22rem]">
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/14 blur-3xl sm:h-72 sm:w-72" />
                {[
                  { file: 'major-18.png', name: 'The Moon', x: '-72%', rot: -13, z: 1, delay: '0s' },
                  { file: 'major-19.png', name: 'The Sun', x: '-28%', rot: 12, z: 2, delay: '1.4s' },
                  { file: 'major-17.png', name: 'The Star', x: '-50%', rot: 0, z: 3, delay: '0.7s' },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="absolute left-1/2 top-1/2 w-32 sm:w-40"
                    style={{ transform: `translate(${c.x}, -50%) rotate(${c.rot}deg)`, zIndex: c.z }}
                  >
                    <div className="landing-float" style={{ animationDelay: c.delay }}>
                      <img
                        src={`${deckDir}/${c.file}`}
                        alt={c.name}
                        onError={(e) => { if (theme !== 'starot') (e.target as HTMLImageElement).src = `${DECKS.starot.dir}/${c.file}`; }}
                        draggable={false}
                        className="w-full rounded-xl border border-accent/40 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(214,179,106,0.12)] transition-transform duration-300 hover:-translate-y-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-accent-muted/75 sm:text-[11px]">
                {copy.deckCaption}
              </p>

              {/* 3 + 1 진행 안내 — 리딩 화면의 페이즈 색상과 동일한 언어 */}
              <div className="mt-5 rounded-[1.4rem] border border-line/12 bg-glass/5 p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-accent-muted sm:text-xs sm:tracking-[0.24em]">
                  <span>Staro 리딩은 이렇게 진행돼요</span>
                  <span className="rounded-full border border-line/12 px-3 py-1 text-[9px] text-accent-soft sm:text-[10px]">3 + 1</span>
                </div>
                <div className="mt-3.5 flex items-center gap-1.5 sm:gap-2">
                  {[
                    { label: '과거', cls: theme === 'starot' ? 'border-[#a78bfa]/45 bg-[#a78bfa]/10 text-[#ddd6fe]' : 'border-[#8b6ad6]/45 bg-[#8b6ad6]/10 text-[#6b4bb8]' },
                    { label: '현재', cls: 'border-accent-hi/45 bg-accent-hi/10 text-accent-soft' },
                    { label: '미래', cls: theme === 'starot' ? 'border-[#7dd3fc]/45 bg-[#7dd3fc]/10 text-[#bae6fd]' : 'border-[#3d9fce]/45 bg-[#3d9fce]/10 text-[#1f7fae]' },
                  ].map((step, i) => (
                    <React.Fragment key={step.label}>
                      {i > 0 && <span className="text-accent-muted/40">→</span>}
                      <span className={`flex-1 rounded-full border px-2 py-1.5 text-center text-[11px] font-medium sm:text-xs ${step.cls}`}>{step.label}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-accent/70">+</span>
                  <span className={`flex-1 rounded-full border border-dashed px-2 py-1.5 text-center text-[11px] font-medium sm:text-xs ${theme === 'starot' ? 'border-[#f9a8d4]/45 bg-[#f9a8d4]/10 text-[#fbd3e5]' : 'border-[#e0679e]/45 bg-[#e0679e]/10 text-[#c74a82]'}`}>조언</span>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-ink sm:text-sm sm:leading-6">
                  세 장의 카드로 현재 상황부터 원인, 미래의 흐름까지 전체적인 맥락을 종합적으로 읽고,
                  현재, 주변 환경, 가능성 있는 미래의 흐름을 함께 해석합니다.
                  결과는 여러분의 현재의 선택과 행동에 따라 달라질 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingScreen;
