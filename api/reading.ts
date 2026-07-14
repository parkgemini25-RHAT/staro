import { generateReading, validateReadingRequest, ReadingRequestError } from './_lib/tarot';

// Vercel serverless function: POST /api/reading
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question, cards, readingTypeLabel } = validateReadingRequest(req.body);
    const result = await generateReading(process.env.GEMINI_API_KEY, question, cards, readingTypeLabel);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ReadingRequestError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Reading generation failed:', error);
    res.status(500).json({ error: '리딩 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }
}
