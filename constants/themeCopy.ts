import { ThemeId } from '../utils/cardAssets';

// 테마별 브랜드 카피 — 기능은 공유하고 말투만 갈아끼운다.
// starot 값은 기존 하드코딩 문구와 동일 (값 보존).
export interface ThemeCopy {
  brandName: string;
  headerTagline: string;
  heroBadge: string;
  heroTagline: string;
  heroTitleAccent: string;
  heroDesc: string;
  deckCaption: string;
  pickCopy: { title: string; sub: string }[];
  adviceBadge: string;
  adviceTitle: string;
  adviceSub: string;
  shuffleHint: string;
  pickHint: string;
  waiting: string;
}

export const THEME_COPY: Record<ThemeId, ThemeCopy> = {
  starot: {
    brandName: 'Starot',
    headerTagline: 'Tarot for modern rituals',
    heroBadge: 'Oracle Atelier',
    heroTagline: 'Tarot for modern rituals',
    heroTitleAccent: '질문 하나로 흐름을 읽다',
    heroDesc: '지금 궁금한 한 가지를 적어보세요. 가까운 미래, 그리고 지금 필요한 조언까지 차분하게 풀어드립니다.',
    deckCaption: '78개의 별빛을 주제로한 오리지널 덱',
    pickCopy: [
      { title: '카드를 뽑아, 과거를 바라보세요', sub: '이 고민이 시작된 자리를 비추는 첫 번째 장입니다' },
      { title: '카드를 뽑아, 현재를 느껴보세요', sub: '당신이 서 있는 현재를 비추는 두 번째 장입니다' },
      { title: '카드를 뽑아, 다가올 미래를 열어보세요', sub: '흐름이 향하는 곳을 비추는 세 번째 장입니다' },
    ],
    adviceBadge: '마지막 한 장 · 조언',
    adviceTitle: '카드를 뽑아, 지금 필요한 조언을 청해보세요',
    adviceSub: '세 장의 흐름을 읽었습니다. 별이 건네는 조언 한 장이 남아 있어요.',
    shuffleHint: '별의 순서를 다시 섞는 중 ···',
    pickHint: '마음이 이끄는 카드 한 장을 클릭하세요',
    waiting: '별들이 당신의 운명을 속삭이고 있습니다 ···',
  },
  tangttung: {
    brandName: '얼렁탕뚱',
    headerTagline: 'Tarot with Sapsaree Tangttung',
    heroBadge: '얼렁탕뚱 타로',
    heroTagline: 'Tarot with Sapsaree Tangttung',
    heroTitleAccent: '탕뚱이가 물어다 주는 오늘의 흐름',
    heroDesc: '궁금한 걸 적어주세요. 액운을 쫓는 삽살개 탕뚱이가 카드 세 장과 조언 한 장을 살포시 물어다 드려요.',
    deckCaption: '78 Tangttung Arcana · 액운을 쫓는 삽살개 덱',
    pickCopy: [
      { title: '카드를 뽑아, 과거를 돌아봐요', sub: '킁킁 — 고민이 시작된 자리를 탕뚱이가 찾아냈어요' },
      { title: '카드를 뽑아, 현재를 살펴봐요', sub: '지금 당신 곁의 흐름을 탕뚱이가 지켜보고 있어요' },
      { title: '카드를 뽑아, 미래를 마중 나가요', sub: '다가올 흐름을 향해 탕뚱이가 폴짝 앞장서요' },
    ],
    adviceBadge: '마지막 한 장 · 조언',
    adviceTitle: '탕뚱이가 물어온 조언 카드를 받아주세요',
    adviceSub: '세 장의 흐름을 다 읽었어요. 탕뚱이가 골라온 마지막 한 장이 남았어요.',
    shuffleHint: '탕뚱이가 카드를 신나게 섞는 중 🐾',
    pickHint: '마음이 가는 카드를 살짝 눌러주세요 🐾',
    waiting: '탕뚱이가 별들의 이야기를 엿듣고 있어요 ···',
  },
};
