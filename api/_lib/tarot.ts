import { GoogleGenAI, Type, Schema } from '@google/genai';

// Server-side only. The Gemini API key must never reach the client bundle.

export interface ReadingCardInput {
  nameKo: string;
  position: string;
  isReversed: boolean;
}

export interface ReadingResult {
  pastReading: string;
  presentReading: string;
  futureReading: string;
  adviceReading: string;
  pastCardMeaning: string;
  presentCardMeaning: string;
  futureCardMeaning: string;
  adviceCardMeaning: string;
  summary: string;
  oneLineAdvice: string;
}

export class ReadingRequestError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const readingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pastReading: { type: Type.STRING, description: "Direct answer to the user's question based on the Past card context. Do NOT explain the card definition here, just the situation." },
    pastCardMeaning: { type: Type.STRING, description: "Brief explanation of the card's generic meaning (Upright/Reversed)." },
    presentReading: { type: Type.STRING, description: "Direct answer to the user's question based on the Present card context. Do NOT explain the card definition here, just the situation." },
    presentCardMeaning: { type: Type.STRING, description: "Brief explanation of the card's generic meaning (Upright/Reversed)." },
    futureReading: { type: Type.STRING, description: "Prediction for the user's question based on the Future card context. Do NOT explain the card definition here." },
    futureCardMeaning: { type: Type.STRING, description: "Brief explanation of the card's generic meaning (Upright/Reversed)." },
    adviceReading: { type: Type.STRING, description: "Actionable advice for the user's question. Do NOT explain the card definition here." },
    adviceCardMeaning: { type: Type.STRING, description: "Brief explanation of the card's generic meaning (Upright/Reversed)." },
    summary: { type: Type.STRING, description: 'Comprehensive summary combining all cards (approx 5-7 sentences)' },
    oneLineAdvice: { type: Type.STRING, description: 'A single sentence final piece of advice' },
  },
  required: [
    'pastReading', 'pastCardMeaning',
    'presentReading', 'presentCardMeaning',
    'futureReading', 'futureCardMeaning',
    'adviceReading', 'adviceCardMeaning',
    'summary', 'oneLineAdvice',
  ],
};

const VALID_POSITIONS = new Set(['past', 'present', 'future', 'advice']);

export const validateReadingRequest = (body: unknown): { question: string; cards: ReadingCardInput[]; readingTypeLabel: string } => {
  const { question, cards, readingTypeLabel } = (body ?? {}) as Record<string, unknown>;

  if (typeof question !== 'string' || !question.trim()) {
    throw new ReadingRequestError('question is required');
  }
  if (question.length > 500) {
    throw new ReadingRequestError('question is too long (max 500 chars)');
  }
  if (!Array.isArray(cards) || cards.length === 0 || cards.length > 4) {
    throw new ReadingRequestError('cards must be an array of 1-4 items');
  }
  const parsedCards = cards.map((c) => {
    const card = (c ?? {}) as Record<string, unknown>;
    if (typeof card.nameKo !== 'string' || card.nameKo.length > 60) {
      throw new ReadingRequestError('invalid card name');
    }
    if (typeof card.position !== 'string' || !VALID_POSITIONS.has(card.position)) {
      throw new ReadingRequestError('invalid card position');
    }
    return {
      nameKo: card.nameKo,
      position: card.position,
      isReversed: card.isReversed === true,
    };
  });
  const label = typeof readingTypeLabel === 'string' && readingTypeLabel.length <= 30 ? readingTypeLabel : '기본 흐름';

  return { question: question.trim(), cards: parsedCards, readingTypeLabel: label };
};

// Dev-only mock so the full flow can be exercised without an API key.
// The vite dev middleware falls back to this when GEMINI_API_KEY is missing;
// the production Vercel function never uses it.
export const generateMockReading = (question: string, cards: ReadingCardInput[]): ReadingResult => {
  const byPosition: Record<string, ReadingCardInput | undefined> = {};
  cards.forEach((c) => { byPosition[c.position] = c; });

  const name = (pos: string) => byPosition[pos]?.nameKo ?? '카드';
  const orient = (pos: string) => (byPosition[pos]?.isReversed ? '역방향' : '정방향');

  return {
    pastReading: `지나온 시간에는 ${name('past')}(${orient('past')})의 기운이 흐르고 있었어요. 지금의 고민이 만들어진 배경에는 스스로 정리하지 못한 감정과 선택들이 겹겹이 쌓여 있었습니다.`,
    pastCardMeaning: `${name('past')} ${orient('past')}은(는) 과거의 경험이 현재의 토대가 되었음을 상징합니다.`,
    presentReading: `현재는 ${name('present')}(${orient('present')})이 보여주듯, 겉으로는 평온해 보여도 내면에서는 방향을 정하려는 움직임이 시작된 상태예요.`,
    presentCardMeaning: `${name('present')} ${orient('present')}은(는) 지금 이 순간의 에너지와 마음가짐을 나타냅니다.`,
    futureReading: `가까운 미래에는 ${name('future')}(${orient('future')})의 흐름이 다가옵니다. 작은 계기가 생각보다 큰 변화를 이끌어낼 수 있는 시기입니다.`,
    futureCardMeaning: `${name('future')} ${orient('future')}은(는) 다가올 흐름의 방향성을 암시합니다.`,
    adviceReading: `${name('advice')}(${orient('advice')})이 전하는 조언은 분명합니다. 결과를 통제하려 하기보다, 지금 할 수 있는 한 걸음에 집중하세요.`,
    adviceCardMeaning: `${name('advice')} ${orient('advice')}은(는) 지금 취해야 할 태도와 행동의 힌트를 줍니다.`,
    summary: `"${question}"에 대한 카드들의 흐름을 종합하면, 과거의 경험이 현재의 갈림길을 만들었고, 그 갈림길은 이미 한쪽으로 기울기 시작했습니다. 다가오는 흐름은 당신이 먼저 움직일 때 훨씬 유리하게 작동합니다. 주저함은 이해되지만, 카드들은 공통적으로 '준비는 이미 충분하다'고 말하고 있어요. 남은 것은 타이밍이 아니라 결심입니다. ※ 현재 연습 모드(목업) 응답입니다 — GEMINI_API_KEY를 설정하면 실제 AI 리딩이 제공됩니다.`,
    oneLineAdvice: '흐름은 이미 움직이기 시작했으니, 첫걸음을 미루지 마세요.',
  };
};

export const generateReading = async (
  apiKey: string | undefined,
  question: string,
  cards: ReadingCardInput[],
  readingTypeLabel: string,
): Promise<ReadingResult> => {
  if (!apiKey) {
    throw new ReadingRequestError('GEMINI_API_KEY is not configured on the server', 500);
  }

  const ai = new GoogleGenAI({ apiKey });

  const cardDescriptions = cards
    .map((c) => `${c.position.toUpperCase()} Position: ${c.nameKo} (${c.isReversed ? 'Reverse/역방향' : 'Upright/정방향'})`)
    .join('\n');

  const prompt = `
    You are an expert Tarot Reader.
    User Question: "${question}"

    Reading mode: ${readingTypeLabel}

    The user has drawn the following cards:
    ${cardDescriptions}

    Please interpret these cards in Korean based on the question and the reading mode.

    IMPORTANT INSTRUCTION:
    You must separate the "Contextual Reading" (Answer to the question) from the "Card Meaning" (Definition).

    1. **Reading Fields (pastReading, presentReading, etc.)**:
       - Focus ONLY on the user's question ("${question}").
       - Interpret what this card means *specifically* for their situation.
       - Do NOT say "This card means...". Instead say "In the past, you likely experienced..." or "Currently, the situation is..."

    2. **Card Meaning Fields (pastCardMeaning, presentCardMeaning, etc.)**:
       - Briefly explain the technical meaning of the card in its orientation (Upright/Reversed).
       - E.g., "The Fool reversed signifies recklessness..."

    3. **General Rules**:
       - Tone: Polite (존댓말), empathetic, mystical but practical.
       - Analyze the flow from Past -> Present -> Future.

    Return the result STRICTLY in JSON format matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: readingSchema,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
    throw new ReadingRequestError('No response from AI', 502);
  }

  return JSON.parse(text) as ReadingResult;
};
