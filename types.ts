export interface TarotCard {
  id: number;
  name: string;
  nameKo: string; // Korean Name
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number?: number | string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  position: 'past' | 'present' | 'future' | 'advice';
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

export enum ReadingState {
  IDLE,
  DRAWING,
  INTERPRETING,
  COMPLETED,
  ERROR
}