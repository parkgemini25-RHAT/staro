import { TarotCard } from './types';

// Helper to generate deck
const generateDeck = (): TarotCard[] => {
  const deck: TarotCard[] = [];
  let idCounter = 1;

  // 1. Major Arcana
  const majors = [
    { en: "The Fool", ko: "광대 (The Fool)" },
    { en: "The Magician", ko: "마법사 (The Magician)" },
    { en: "The High Priestess", ko: "고위 여사제 (The High Priestess)" },
    { en: "The Empress", ko: "여황제 (The Empress)" },
    { en: "The Emperor", ko: "황제 (The Emperor)" },
    { en: "The Hierophant", ko: "교황 (The Hierophant)" },
    { en: "The Lovers", ko: "연인 (The Lovers)" },
    { en: "The Chariot", ko: "전차 (The Chariot)" },
    { en: "Strength", ko: "힘 (Strength)" },
    { en: "The Hermit", ko: "은둔자 (The Hermit)" },
    { en: "Wheel of Fortune", ko: "운명의 수레바퀴 (Wheel of Fortune)" },
    { en: "Justice", ko: "정의 (Justice)" },
    { en: "The Hanged Man", ko: "매달린 사람 (The Hanged Man)" },
    { en: "Death", ko: "죽음 (Death)" },
    { en: "Temperance", ko: "절제 (Temperance)" },
    { en: "The Devil", ko: "악마 (The Devil)" },
    { en: "The Tower", ko: "탑 (The Tower)" },
    { en: "The Star", ko: "별 (The Star)" },
    { en: "The Moon", ko: "달 (The Moon)" },
    { en: "The Sun", ko: "태양 (The Sun)" },
    { en: "Judgement", ko: "심판 (Judgement)" },
    { en: "The World", ko: "세계 (The World)" }
  ];

  majors.forEach((m, index) => {
    deck.push({ 
      id: idCounter++, 
      name: m.en, 
      nameKo: m.ko, 
      arcana: 'Major',
      number: index // 0 for Fool, 21 for World
    });
  });

  // 2. Minor Arcana
  const suits: ('Wands' | 'Cups' | 'Swords' | 'Pentacles')[] = ['Wands', 'Cups', 'Swords', 'Pentacles'];
  const suitKoMap = { Wands: '지팡이', Cups: '컵', Swords: '검', Pentacles: '동전' };
  
  suits.forEach(suit => {
    // Ace to 10
    for (let i = 1; i <= 10; i++) {
      let nameKo = `${suitKoMap[suit]} ${i}`;
      if (i === 1) nameKo = `${suitKoMap[suit]} 에이스 (Ace)`;
      
      deck.push({
        id: idCounter++,
        name: `${i} of ${suit}`,
        nameKo: nameKo,
        arcana: 'Minor',
        suit,
        number: i
      });
    }
    // Court Cards
    const courts = [
      { en: 'Page', ko: '시종' },
      { en: 'Knight', ko: '기사' },
      { en: 'Queen', ko: '여왕' },
      { en: 'King', ko: '왕' }
    ];
    courts.forEach(c => {
      deck.push({
        id: idCounter++,
        name: `${c.en} of ${suit}`,
        nameKo: `${suitKoMap[suit]} ${c.ko} (${c.en})`,
        arcana: 'Minor',
        suit,
        number: c.en
      });
    });
  });

  return deck;
};

export const FULL_DECK = generateDeck();