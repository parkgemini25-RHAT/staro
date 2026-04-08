import React from 'react';

interface LandingScreenProps {
  question: string;
  exampleQuestion: string;
  onQuestionChange: (value: string) => void;
  onStart: () => void;
  onFillExample: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  question,
  exampleQuestion,
  onQuestionChange,
  onStart,
  onFillExample,
}) => {
  return (
    <section className="relative isolate min-h-screen overflow-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,182,103,0.18),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(140,98,255,0.16),transparent_28%),linear-gradient(180deg,#05030b_0%,#11071d_42%,#1a0d2c_100%)]" />
      <div className="absolute inset-0 opacity-40 mix-blend-screen [background-image:radial-gradient(circle_at_1px_1px,rgba(255,248,220,0.55)_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="absolute left-[-8%] top-[12%] h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />
      <div className="absolute right-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#f59e0b]/15 blur-3xl" />
      <div className="absolute bottom-[-10%] left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-[#ec4899]/12 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-start sm:items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="order-2 animate-fade-in-up lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b36a]/35 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f3d98b] backdrop-blur-md sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.28em]">
              Oracle Atelier
            </div>

            <div className="mt-4 max-w-3xl sm:mt-6">
              <p className="text-[11px] tracking-[0.32em] text-[#c8b27a]/90 uppercase sm:text-sm sm:tracking-[0.45em]">
                Tarot for modern rituals
              </p>
              <h1 className="mt-4 font-display text-[2.9rem] leading-[0.9] text-[#fff7e8] sm:mt-5 sm:text-6xl lg:text-7xl">
                Starot,
                <br />
                <span className="text-[#d6b36a]">질문 하나로 흐름을 읽다</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-6 text-[#e7def8]/82 sm:mt-6 sm:text-lg sm:leading-7">
                지금 궁금한 한 가지를 적어보세요. 카드가 현재 흐름과 가까운 미래,
                그리고 지금 필요한 조언까지 차분하게 풀어드립니다.
              </p>
            </div>

            <div className="mt-7 max-w-xl rounded-[1.6rem] border border-white/12 bg-white/6 p-3.5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-10 sm:rounded-[1.8rem] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                <span>Reading setup</span>
                <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] text-[#f6e8bf]">
                  기본 흐름 4장 리딩
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-[#d8cfeb] sm:text-sm sm:leading-6">
                가장 기본이 되는 4장 스프레드로 현재 흐름을 읽습니다. 복잡한 선택 없이,
                질문만 입력하면 바로 시작돼요.
              </p>
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-[#090512]/70 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                <label className="block text-[10px] uppercase tracking-[0.22em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">
                  질문 입력
                </label>
                <textarea
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder={exampleQuestion}
                  rows={4}
                  className="mt-3 min-h-[112px] w-full resize-none bg-transparent text-[15px] leading-6 text-[#fff8ea] outline-none placeholder:text-[#9f96b8] sm:text-base sm:leading-7"
                />
                <p className="mt-3 rounded-[1rem] border border-[#d6b36a]/18 bg-[#f0d48a]/8 px-3.5 py-3 text-[13px] leading-5 text-[#efe4bf] sm:rounded-2xl sm:px-4 sm:text-sm sm:leading-6">
                  팁 · 예/아니오보다, 지금 어떤 흐름으로 흘러가는지 묻는 질문이 더 잘 맞아요.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                  <button
                    onClick={onFillExample}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-3 text-sm text-[#efe7ff] transition hover:bg-white/10"
                  >
                    예시 질문 넣기
                  </button>
                  <button
                    onClick={onStart}
                    className="group relative inline-flex min-h-[52px] items-center justify-center overflow-hidden rounded-full border border-[#f0d48a]/40 bg-[#f1d18a] px-6 py-3 font-semibold text-[#1d1029] shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)]"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                    리딩 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 animate-fade-in-up [animation-delay:160ms] [animation-fill-mode:both] lg:order-2">
            <div className="relative mx-auto max-w-[24rem] sm:max-w-[28rem]">
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,10,29,0.88),rgba(10,6,18,0.92))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#cdb682] sm:text-xs sm:tracking-[0.28em]">
                  <span>How it works</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] text-[#f6e8bf]">4 cards</span>
                </div>

                <div className="mt-4 rounded-[1.35rem] border border-[#d7b568]/18 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 sm:mt-5 sm:rounded-[1.6rem] sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] tracking-[0.22em] text-[#f0dca4] uppercase sm:text-sm sm:tracking-[0.24em]">
                        Basic spread
                      </p>
                      <h2 className="mt-3 font-display text-2xl leading-tight text-[#fff6e6] sm:text-3xl">
                        Present
                        <br />
                        to Advice
                      </h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f0d48a]/30 bg-white/8 text-xl text-[#f0d48a] shadow-[inset_0_0_30px_rgba(240,212,138,0.15)] sm:h-14 sm:w-14 sm:text-2xl">
                      ✦
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2 sm:mt-6 sm:gap-3">
                    {['과거', '현재', '미래', '조언'].map((label, index) => (
                      <div
                        key={label}
                        className={`rounded-[1rem] border px-2 py-3 text-center sm:rounded-[1.2rem] sm:px-3 sm:py-4 ${index === 1 ? 'border-[#f0d48a]/45 bg-[#f0d48a]/12' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="mx-auto mb-2.5 flex h-14 w-full max-w-[3.8rem] items-center justify-center rounded-[0.9rem] bg-[linear-gradient(180deg,#3d2856,#1a112a)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:mb-3 sm:h-20 sm:max-w-[5rem] sm:rounded-2xl">
                          <div className="text-lg text-[#f0d48a] sm:text-xl">✧</div>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#dccda8] sm:text-xs sm:tracking-[0.24em]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">What you get</p>
                    <p className="mt-2 text-[13px] leading-5 text-[#ece3ff] sm:text-sm sm:leading-6">
                      현재 상황 해석, 가까운 미래 흐름, 그리고 지금 필요한 한 줄 조언까지 바로 확인할 수 있어요.
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#cdb682] sm:text-xs sm:tracking-[0.24em]">Best for</p>
                    <p className="mt-2 text-[13px] leading-5 text-[#ece3ff] sm:text-sm sm:leading-6">
                      관계, 일, 감정, 선택 앞에서 전체 흐름을 먼저 보고 싶은 순간에 가장 잘 맞는 시작형 리딩입니다.
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
