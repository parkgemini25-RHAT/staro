import React from 'react';
import { SavedReading } from '../types';

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
  onQuestionChange: (value: string) => void;
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
  onQuestionChange,
  onStart,
  onFillExample,
  onLoadReading,
  onDeleteReading,
}) => {
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-start sm:items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="order-1 animate-fade-in-up lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b36a]/35 bg-white/5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f3d98b] backdrop-blur-md sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.28em]">
              Oracle Atelier
            </div>

            <div className="mt-4 max-w-3xl sm:mt-6">
              <p className="text-[10px] tracking-[0.24em] text-[#c8b27a]/90 uppercase sm:text-sm sm:tracking-[0.45em]">
                Tarot for modern rituals
              </p>
              <h1 className="mt-3 font-display text-[2.25rem] leading-[0.95] text-[#fff7e8] sm:mt-5 sm:text-6xl lg:text-7xl">
                Starot,
                <br />
                <span className="text-[2rem] text-[#d6b36a] sm:text-inherit">질문 하나로 흐름을 읽다</span>
              </h1>
              <p className="mt-4 max-w-xl text-[14px] leading-6 text-[#e7def8]/82 sm:mt-6 sm:text-lg sm:leading-7">
                지금 궁금한 한 가지를 적어보세요. 카드가 현재 흐름과 가까운 미래,
                그리고 지금 필요한 조언까지 차분하게 풀어드립니다.
              </p>
            </div>

            <div className="mt-6 max-w-xl rounded-[1.4rem] border border-white/12 bg-white/6 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-10 sm:rounded-[1.8rem] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.16em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                <span>Reading setup</span>
                <span className="rounded-full border border-white/12 px-3 py-1 text-[9px] text-[#f6e8bf] sm:text-[10px]">
                  통배열 3장 + 조언 1장
                </span>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#d8cfeb] sm:text-sm sm:leading-6">
                먼저 세 장으로 과거 → 현재 → 미래의 흐름을 통으로 읽고,
                해석을 확인한 뒤 마지막 조언 카드 한 장을 직접 뽑습니다.
              </p>
              <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-[#090512]/70 p-3 sm:rounded-[1.4rem] sm:p-4">
                <label className="block text-[9px] uppercase tracking-[0.18em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                  질문 입력
                </label>
                <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {QUESTION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => onQuestionChange(cat.question)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition sm:text-xs ${question === cat.question ? 'border-[#f0d48a]/60 bg-[#f0d48a]/15 text-[#f6e8bf]' : 'border-white/12 bg-white/5 text-[#cbc2e4] hover:border-[#d6b36a]/40 hover:text-[#efe4bf]'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder={exampleQuestion}
                  rows={4}
                  className="mt-3 min-h-[108px] w-full resize-none bg-transparent text-[14px] leading-6 text-[#fff8ea] outline-none placeholder:text-[#9f96b8] sm:min-h-[112px] sm:text-base sm:leading-7"
                />
                {errorMessage && (
                  <p className="mt-3 rounded-[0.95rem] border border-[#e07a7a]/30 bg-[#e07a7a]/10 px-3 py-2.5 text-[12px] leading-5 text-[#f3c8c8] sm:rounded-2xl sm:px-4 sm:text-sm animate-fade-in-up">
                    {errorMessage}
                  </p>
                )}
                <p className="mt-3 rounded-[0.95rem] border border-[#d6b36a]/18 bg-[#f0d48a]/8 px-3 py-3 text-[12px] leading-5 text-[#efe4bf] sm:rounded-2xl sm:px-4 sm:text-sm sm:leading-6">
                  팁 · 예/아니오보다, 지금 어떤 흐름으로 흘러가는지 묻는 질문이 더 잘 맞아요.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <button
                    onClick={onFillExample}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-3 text-[14px] text-[#efe7ff] transition hover:bg-white/10 sm:text-sm"
                  >
                    예시 질문 넣기
                  </button>
                  <button
                    onClick={onStart}
                    className="group relative inline-flex min-h-[50px] items-center justify-center overflow-hidden rounded-full border border-[#f0d48a]/40 bg-[#f1d18a] px-6 py-3 text-[15px] font-semibold text-[#1d1029] shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)] sm:min-h-[52px] sm:text-base"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                    리딩 시작하기
                  </button>
                </div>
              </div>
            </div>

            {savedReadings.length > 0 && (
              <div className="mt-5 max-w-xl rounded-[1.4rem] border border-white/12 bg-white/6 p-3 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                  <span>지난 리딩</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[9px] text-[#f6e8bf] sm:text-[10px]">{savedReadings.length}</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {savedReadings.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onLoadReading?.(item)}
                        className="group flex w-full items-center gap-3 rounded-[1rem] border border-white/10 bg-[#090512]/55 px-3.5 py-3 text-left transition hover:border-[#d6b36a]/45 hover:bg-[#0d0718]/80"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] leading-5 text-[#fff8ea] sm:text-sm">{item.question}</p>
                          <p className="mt-0.5 text-[10px] tracking-[0.12em] text-[#cdb682]/80 sm:text-[11px]">
                            {formatSavedDate(item.createdAt)} · {item.cards.slice(0, 2).map(c => c.name).join(', ')} 외 {Math.max(item.cards.length - 2, 0)}장
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-[#cdb682]/70 transition group-hover:text-[#f0d48a]">보기</span>
                        <span
                          role="button"
                          aria-label="리딩 삭제"
                          onClick={(e) => { e.stopPropagation(); onDeleteReading?.(item.id); }}
                          className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-[#9f96b8] transition hover:border-[#e07a7a]/40 hover:text-[#f3c8c8]"
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
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b36a]/14 blur-3xl sm:h-72 sm:w-72" />
                {[
                  { src: '/cards/major-18.png', name: 'The Moon', x: '-72%', rot: -13, z: 1, delay: '0s' },
                  { src: '/cards/major-19.png', name: 'The Sun', x: '-28%', rot: 12, z: 2, delay: '1.4s' },
                  { src: '/cards/major-17.png', name: 'The Star', x: '-50%', rot: 0, z: 3, delay: '0.7s' },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="absolute left-1/2 top-1/2 w-32 sm:w-40"
                    style={{ transform: `translate(${c.x}, -50%) rotate(${c.rot}deg)`, zIndex: c.z }}
                  >
                    <div className="landing-float" style={{ animationDelay: c.delay }}>
                      <img
                        src={c.src}
                        alt={c.name}
                        draggable={false}
                        className="w-full rounded-xl border border-[#d6b36a]/40 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(214,179,106,0.12)] transition-transform duration-300 hover:-translate-y-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-[#cdb682]/75 sm:text-[11px]">
                78 Original Arcana · 별빛 아래 그려진 오리지널 덱
              </p>

              {/* 3 + 1 진행 안내 — 리딩 화면의 페이즈 색상과 동일한 언어 */}
              <div className="mt-5 rounded-[1.4rem] border border-white/12 bg-white/5 p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                  <span>스타로 리딩은 이렇게 진행돼요</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[9px] text-[#f6e8bf] sm:text-[10px]">3 + 1</span>
                </div>
                <div className="mt-3.5 flex items-center gap-1.5 sm:gap-2">
                  {[
                    { label: '과거', cls: 'border-[#a78bfa]/45 bg-[#a78bfa]/10 text-[#ddd6fe]' },
                    { label: '현재', cls: 'border-[#f0d48a]/45 bg-[#f0d48a]/10 text-[#f6e8bf]' },
                    { label: '미래', cls: 'border-[#7dd3fc]/45 bg-[#7dd3fc]/10 text-[#bae6fd]' },
                  ].map((step, i) => (
                    <React.Fragment key={step.label}>
                      {i > 0 && <span className="text-[#cdb682]/40">→</span>}
                      <span className={`flex-1 rounded-full border px-2 py-1.5 text-center text-[11px] font-medium sm:text-xs ${step.cls}`}>{step.label}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-[#d6b36a]/70">+</span>
                  <span className="flex-1 rounded-full border border-dashed border-[#f9a8d4]/45 bg-[#f9a8d4]/10 px-2 py-1.5 text-center text-[11px] font-medium text-[#fbd3e5] sm:text-xs">조언</span>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-[#d8cfeb] sm:text-sm sm:leading-6">
                  세 장으로 과거 → 현재 → 미래의 흐름을 통으로 읽고,
                  해석을 확인한 뒤 마지막 조언 카드를 직접 뽑습니다.
                  뽑은 카드는 클릭하면 빛에 반응하는 상세 보기로 이어져요.
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
