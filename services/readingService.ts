import { DrawnCard, ReadingResponse } from '../types';

// Calls the server-side proxy so the Gemini API key never ships to the browser.
export const getTarotReading = async (
  question: string,
  cards: DrawnCard[],
  readingTypeLabel: string = '기본 흐름',
  persona: string = 'starot',
): Promise<ReadingResponse> => {
  const response = await fetch('/api/reading', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      cards: cards.map((c) => ({
        name: c.name,
        nameKo: c.nameKo,
        position: c.position,
        isReversed: c.isReversed,
      })),
      readingTypeLabel,
      persona,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `리딩 요청이 실패했습니다 (${response.status})`);
  }

  return response.json() as Promise<ReadingResponse>;
};
