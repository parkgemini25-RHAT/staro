import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { DrawnCard, ReadingResponse } from '../types';

// Vite client env vars must use import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const getAiClient = () => {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is missing. Add it to your Vercel environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

// Define the strict JSON schema for the response
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
      model: model,
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

// --- TTS Functionality ---

export const getTarotSpeech = async (text: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read the following Tarot reading in a calm, mystical, and soothing Korean voice: "${text}"` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' usually has a good neutral tone
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini");
    }
    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

// --- Audio Utilities ---

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}