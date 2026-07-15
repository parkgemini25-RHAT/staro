// 78장 전체의 타로 심층 해설을 Gemini로 1회 생성해 constants/cardDetails.json에 저장.
// 실행: node scripts/generate-card-details.mjs  (GEMINI_API_KEY는 .env.local에서 읽음)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { GoogleGenAI, Type } from '@google/genai';

// ── env ──────────────────────────────────────────────────────────────
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const apiKey = envFile.match(/^GEMINI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) { console.error('GEMINI_API_KEY not found in .env.local'); process.exit(1); }

// ── deck (constants.ts와 동일한 규칙) ─────────────────────────────────
const majors = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
const suits = ['Wands','Cups','Swords','Pentacles'];
const courts = ['Page','Knight','Queen','King'];
const deck = [
  ...majors,
  ...suits.flatMap(s => [
    ...Array.from({ length: 10 }, (_, i) => `${i + 1} of ${s}`),
    ...courts.map(c => `${c} of ${s}`),
  ]),
];
console.log(`deck size: ${deck.length}`);

// ── schema ───────────────────────────────────────────────────────────
const itemSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'The exact English card name given in the input list' },
    element: { type: Type.STRING, description: '원소·점성 대응. 예: "물 (Water) · 게자리" 또는 "불 (Fire) · 사자자리". 메이저는 대응 행성/별자리.' },
    detail: { type: Type.STRING, description: '타로 관점의 심층 해설 4-5문장 (한국어 존댓말). 카드의 상징 구조, 수비학적 의미, 덱 안에서의 위치와 여정, 자주 오해되는 지점까지.' },
    uprightDetail: { type: Type.STRING, description: '정방향 상세 해석 2-3문장 (한국어 존댓말). 어떤 상황에서 어떤 메시지로 읽히는지 구체적으로.' },
    reversedDetail: { type: Type.STRING, description: '역방향 상세 해석 2-3문장 (한국어 존댓말). 에너지의 왜곡/과잉/결핍 관점으로.' },
    loveNote: { type: Type.STRING, description: '연애·관계 맥락에서의 의미 1-2문장 (한국어 존댓말).' },
    workNote: { type: Type.STRING, description: '일·커리어·금전 맥락에서의 의미 1-2문장 (한국어 존댓말).' },
  },
  required: ['name', 'element', 'detail', 'uprightDetail', 'reversedDetail', 'loveNote', 'workNote'],
};

const ai = new GoogleGenAI({ apiKey });
const outPath = new URL('../constants/cardDetails.json', import.meta.url);
const result = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {};

const BATCH = 13;
for (let i = 0; i < deck.length; i += BATCH) {
  const batch = deck.slice(i, i + BATCH).filter(name => !result[name]);
  if (batch.length === 0) { console.log(`batch ${i / BATCH + 1}: already done, skip`); continue; }

  const prompt = `당신은 라이더-웨이트 타로 전문가입니다. 아래 카드들 각각에 대해 타로 관점의 자세한 한국어 해설을 작성하세요.
톤: 존댓말, 차분하고 신비롭지만 실용적. 뜬구름 잡는 얘기 금지, 상징과 의미를 구체적으로.
카드 목록: ${batch.join(', ')}
반드시 목록의 모든 카드를 빠짐없이, name 필드는 입력된 영문 이름 그대로 반환하세요.`;

  process.stdout.write(`batch ${Math.floor(i / BATCH) + 1} (${batch.length} cards)... `);
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: Type.ARRAY, items: itemSchema },
        temperature: 0.6,
      },
    });
    const items = JSON.parse(res.text);
    for (const item of items) {
      const { name, ...rest } = item;
      if (deck.includes(name)) result[name] = rest;
      else console.warn(`\n  unknown name from model: ${name}`);
    }
    writeFileSync(outPath, JSON.stringify(result, null, 1), 'utf8');
    console.log(`ok (total ${Object.keys(result).length}/78)`);
  } catch (e) {
    console.error(`FAILED: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 1500));
}

const missing = deck.filter(n => !result[n]);
console.log(missing.length === 0 ? '✅ ALL 78 DONE' : `❌ missing ${missing.length}: ${missing.join(', ')}`);
