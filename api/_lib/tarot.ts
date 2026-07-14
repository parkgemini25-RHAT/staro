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
