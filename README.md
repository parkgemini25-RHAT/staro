# Starot

AI 타로 리딩 웹앱. 질문을 입력하고 4장의 카드를 뽑으면 Gemini가 과거·현재·미래·조언 구조로 해석해줍니다.

- React 19 + TypeScript + Vite + Tailwind CSS v4
- Gemini 호출은 서버 프록시(`api/reading.ts`)를 통해서만 이루어집니다. **API 키는 클라이언트 번들에 포함되지 않습니다.**

## 로컬 실행

**사전 준비:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```
2. 리포 루트에 `.env.local` 파일을 만들고 Gemini API 키를 설정:
   ```bash
   GEMINI_API_KEY=your-key-here
   ```
   (`VITE_` 접두사를 붙이지 마세요 — 붙이면 키가 브라우저 번들에 노출됩니다.)
3. 실행:
   ```bash
   npm run dev
   ```
   dev 서버가 `/api/reading`을 Vercel 함수와 동일한 로직으로 서빙합니다.

## 배포 (Vercel)

- 프로젝트 환경변수에 `GEMINI_API_KEY`를 추가하면 `api/reading.ts` 서버리스 함수가 사용합니다.

## 듀얼 테마 (Starot ✦ / 얼렁탕뚱 🐾)

우측 상단 스위처로 두 덱을 전환합니다. 기능 코드는 100% 공유하고
디자인 토큰(CSS 변수) · 덱 이미지 · 카피 · AI 페르소나만 테마별로 갈립니다.

- 토큰: [index.css](index.css)의 `@theme` + `[data-theme='tangttung']` 오버라이드
- 덱: `public/decks/{starot|tangttung}/` (파일명 규칙 동일, 79장) —
  탕뚱 이미지가 없는 카드는 starot 아트로 자동 폴백
- 카피: [constants/themeCopy.ts](constants/themeCopy.ts)
- 페르소나: API `persona` 필드 → 탕뚱이면 다정한 수호견 톤

## 구조

```
api/reading.ts       # POST /api/reading — Vercel 서버리스 함수
api/_lib/tarot.ts    # 프롬프트/스키마/검증/페르소나 (서버 전용)
services/readingService.ts  # 클라이언트 → 프록시 fetch
contexts/ThemeContext.tsx    # 테마 상태 (+localStorage, data-theme)
components/          # LandingScreen, CardDisplay, CardDetailModal
constants.ts         # 78장 덱 데이터
constants/themeCopy.ts       # 테마별 카피 사전
public/decks/        # starot/, tangttung/ 카드 에셋
docs/card-image-generation.md            # Starot 덱 생성 가이드
docs/card-image-generation-tangttung.md  # 얼렁탕뚱 덱 생성 가이드
```
