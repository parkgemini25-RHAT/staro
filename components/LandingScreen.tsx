import React from 'react';
import { SavedReading } from '../types';

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
                  기본 흐름 4장 리딩
                </span>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#d8cfeb] sm:text-sm sm:leading-6">
                가장 기본이 되는 4카드 타로 리딩이에요. 첫 번째 카드는 지나온 흐름,
                두 번째 카드는 지금의 상태, 세 번째 카드는 가까운 미래,
                마지막 카드는 지금 필요한 조언을 보여줍니다.
              </p>
              <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-[#090512]/70 p-3 sm:rounded-[1.4rem] sm:p-4">
                <label className="block text-[9px] uppercase tracking-[0.18em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                  질문 입력
                </label>
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
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.45rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,10,29,0.88),rgba(10,6,18,0.92))] p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#cdb682] sm:text-xs sm:tracking-[0.28em]">
                  <span>4카드 타로는 이렇게 봐요</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[9px] text-[#f6e8bf] sm:text-[10px]">4 cards</span>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-[#d7b568]/18 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 sm:mt-5 sm:rounded-[1.6rem] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] tracking-[0.18em] text-[#f0dca4] uppercase sm:text-sm sm:tracking-[0.24em]">
                        기본 흐름 리딩
                      </p>
                      <h2 className="mt-2.5 font-display text-[1.55rem] leading-tight text-[#fff6e6] sm:mt-3 sm:text-3xl">
                        질문 하나를
                        <br />
                        4장으로 나눠서 봅니다
                      </h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0d48a]/30 bg-white/8 text-lg text-[#f0d48a] shadow-[inset_0_0_30px_rgba(240,212,138,0.15)] sm:h-14 sm:w-14 sm:text-2xl">
                      ✦
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-1.5 sm:mt-6 sm:gap-3">
                    {['과거', '현재', '미래', '조언'].map((label, index) => (
                      <div
                        key={label}
                        className={`rounded-[0.9rem] border px-1.5 py-2.5 text-center sm:rounded-[1.2rem] sm:px-3 sm:py-4 ${index === 1 ? 'border-[#f0d48a]/45 bg-[#f0d48a]/12' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="mx-auto mb-2 flex h-12 w-full max-w-[3.1rem] items-center justify-center rounded-[0.8rem] bg-[linear-gradient(180deg,#3d2856,#1a112a)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:mb-3 sm:h-20 sm:max-w-[5rem] sm:rounded-2xl">
                          <div className="text-base text-[#f0d48a] sm:text-xl">✧</div>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[#dccda8] sm:text-xs sm:tracking-[0.24em]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.4rem] sm:p-4">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">카드가 알려주는 것</p>
                    <p className="mt-2 text-[12px] leading-5 text-[#ece3ff] sm:text-sm sm:leading-6">
                      1장은 왜 이런 고민이 생겼는지 배경을 보고, 2장은 지금 내 상태를 봐요.
                      3장은 가까운 흐름이 어디로 가는지 보여주고, 4장은 지금 가장 도움이 되는 조언을 줍니다.
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.4rem] sm:p-4">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">이럴 때 잘 맞아요</p>
                    <p className="mt-2 text-[12px] leading-5 text-[#ece3ff] sm:text-sm sm:leading-6">
                      연애, 일, 인간관계, 선택 같은 고민에서 하나만 콕 집기보다,
                      전체 흐름을 먼저 이해하고 싶을 때 잘 맞습니다. 타로를 처음 보는 사람도 보기 쉬워요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingScreen;
