import React from 'react';

interface LandingScreenProps {
  question: string;
  selectedReadingTypeLabel: string;
  readingDescription: string;
  questionTip: string;
  exampleQuestion: string;
  onQuestionChange: (value: string) => void;
  onStart: () => void;
  onRefineQuestion: () => void;
  onFillExample: () => void;
}

const featurePills = ['오늘의 흐름', '관계 리딩', '결정 조언'];

const LandingScreen: React.FC<LandingScreenProps> = ({
  question,
  selectedReadingTypeLabel,
  readingDescription,
  questionTip,
  exampleQuestion,
  onQuestionChange,
  onStart,
  onRefineQuestion,
  onFillExample,
}) => {
  return (
    <section className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,182,103,0.18),transparent_30%),radial-gradient(circle_at_20%_20%,rgba(140,98,255,0.16),transparent_28%),linear-gradient(180deg,#05030b_0%,#11071d_42%,#1a0d2c_100%)]" />
      <div className="absolute inset-0 opacity-40 mix-blend-screen [background-image:radial-gradient(circle_at_1px_1px,rgba(255,248,220,0.55)_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="absolute left-[-8%] top-[12%] h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />
      <div className="absolute right-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#f59e0b]/15 blur-3xl" />
      <div className="absolute bottom-[-10%] left-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-[#ec4899]/12 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b36a]/35 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3d98b] backdrop-blur-md">
              Oracle Atelier
            </div>

            <div className="mt-6 max-w-3xl">
              <p className="font-serif text-sm tracking-[0.45em] text-[#c8b27a]/90 uppercase">Tarot for modern rituals</p>
              <h1 className="mt-5 font-display text-5xl leading-[0.92] text-[#fff7e8] sm:text-6xl lg:text-7xl">
                Starot,
                <br />
                <span className="text-[#d6b36a]">당신의 흐름을 비추다</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#e7def8]/82 sm:text-lg">
                번잡한 점괘 앱 말고, 한 장면처럼 몰입되는 타로 경험으로 바꿨어요.
                질문을 품고 들어오면 카드의 흐름과 조언이 한 편의 리추얼처럼 이어집니다.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-[#efe7ff] backdrop-blur-md"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-10 max-w-xl rounded-[1.8rem] border border-white/12 bg-white/6 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-[#cdb682]">
                <span>Reading setup</span>
                <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] text-[#f6e8bf]">{selectedReadingTypeLabel}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#d8cfeb]">{readingDescription}</p>
              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-[#090512]/70 p-4">
                <label className="block text-xs uppercase tracking-[0.24em] text-[#cdb682]">질문 입력</label>
                <textarea
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder={exampleQuestion}
                  rows={4}
                  className="mt-3 w-full resize-none bg-transparent text-base leading-7 text-[#fff8ea] outline-none placeholder:text-[#9f96b8]"
                />
                <div className="mt-3 rounded-2xl border border-[#d6b36a]/18 bg-[#f0d48a]/8 px-4 py-3 text-sm leading-6 text-[#efe4bf]">
                  질문 팁 · {questionTip}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={onFillExample}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-[#efe7ff] transition hover:bg-white/10"
                  >
                    예시 질문 넣기
                  </button>
                  <button
                    onClick={onRefineQuestion}
                    className="rounded-full border border-[#d6b36a]/30 bg-[#d6b36a]/12 px-4 py-2 text-sm text-[#f5dfaa] transition hover:bg-[#d6b36a]/20"
                  >
                    질문 다듬기
                  </button>
                  <button
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#f0d48a]/40 bg-[#f1d18a] px-6 py-3 font-semibold text-[#1d1029] shadow-[0_20px_60px_rgba(214,179,106,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(214,179,106,0.35)]"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                    리딩 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up [animation-delay:160ms] [animation-fill-mode:both]">
            <div className="relative mx-auto max-w-[28rem]">
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,10,29,0.88),rgba(10,6,18,0.92))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#cdb682]">
                  <span>Tonight&apos;s ritual</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] text-[#f6e8bf]">AI Tarot Reading</span>
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-[#d7b568]/18 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm tracking-[0.24em] text-[#f0dca4] uppercase">Signature Spread</p>
                      <h2 className="mt-3 font-display text-3xl leading-tight text-[#fff6e6]">Moonlit
                        <br />
                        Guidance</h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f0d48a]/30 bg-white/8 text-2xl text-[#f0d48a] shadow-[inset_0_0_30px_rgba(240,212,138,0.15)]">
                      ✦
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {['과거', '현재', '조언'].map((label, index) => (
                      <div
                        key={label}
                        className={`rounded-[1.2rem] border px-3 py-4 text-center ${index === 1 ? 'border-[#f0d48a]/45 bg-[#f0d48a]/12' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="mx-auto mb-3 flex h-20 w-full max-w-[5rem] items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#3d2856,#1a112a)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                          <div className="text-xl text-[#f0d48a]">✧</div>
                        </div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#dccda8]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#cdb682]">Experience</p>
                    <p className="mt-2 text-sm leading-6 text-[#ece3ff]">시작부터 결과 화면까지 톤을 통일해서, 싸구려 신비주의 대신 고급스러운 리추얼 감각으로 잡았습니다.</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#cdb682]">Promise</p>
                    <p className="mt-2 text-sm leading-6 text-[#ece3ff]">질문을 더 잘 다듬고, 카드 해석은 더 또렷하게. 사용자는 그냥 몰입하면 되게 만드는 방향입니다.</p>
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
