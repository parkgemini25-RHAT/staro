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

## 구조

```
api/reading.ts       # POST /api/reading — Vercel 서버리스 함수
api/_lib/tarot.ts    # 프롬프트/스키마/검증 (서버 전용)
services/readingService.ts  # 클라이언트 → 프록시 fetch
components/          # LandingScreen, CardDisplay
constants.ts         # 78장 덱 데이터
docs/card-image-generation.md  # 카드 이미지 생성 가이드 (79장)
```
