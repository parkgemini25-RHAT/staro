export interface TarotCard {
  id: number;
  name: string;
  nameKo: string; // Korean Name
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number?: number | string;
}

export type ReadingPosition = 'past' | 'present' | 'future' | 'advice';

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  position: ReadingPosition;
}

export interface ReadingResponse {
  // Contextual Readings (Answer to the question)
  pastReading: string;
  presentReading: string;
  futureReading: string;
  adviceReading: string;

  // Generic Card Meanings (Technical definition)
  pastCardMeaning: string;
  presentCardMeaning: string;
  futureCardMeaning: string;
  adviceCardMeaning: string;

  summary: string;
  oneLineAdvice: string;
}

export interface SavedReading {
  id: string;
  question: string;
  readingType: string;
  cards: DrawnCard[];
  reading: ReadingResponse;
  createdAt: string;
}

export enum ReadingState {
  IDLE,
  DRAWING,
  ERROR
}