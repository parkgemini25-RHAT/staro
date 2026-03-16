import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DrawnCard, ReadingResponse } from '../types';

// Vite client env vars must use import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const getAiClient = () => {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is missing. Add it to your Vercel environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

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
    summary: { type: Type.STRING, description: "Comprehensive summary combining all cards (approx 5-7 sentences)" },
    oneLineAdvice: { type: Type.STRING, description: "A single sentence final piece of advice" },
  },
  required: [
    "pastReading", "pastCardMeaning",
    "presentReading", "presentCardMeaning",
    "futureReading", "futureCardMeaning",
    "adviceReading", "adviceCardMeaning",
    "summary", "oneLineAdvice"
  ],
};

export const getTarotReading = async (
  question: string,
  cards: DrawnCard[],
  readingTypeLabel: string = '기본 흐름'
): Promise<ReadingResponse> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();

  const cardDescriptions = cards.map(c =>
    `${c.position.toUpperCase()} Position: ${c.nameKo} (${c.isReversed ? 'Reverse/역방향' : 'Upright/정방향'})`
  ).join('\n');

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

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: readingSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ReadingResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
