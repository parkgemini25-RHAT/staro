import path from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Serves POST /api/reading in local dev with the same logic as the Vercel function.
const readingApiDevPlugin = (apiKey: string | undefined): Plugin => ({
  name: 'starot-reading-api-dev',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/reading', async (req, res) => {
      const respond = (status: number, payload: unknown) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'POST') {
        respond(405, { error: 'Method not allowed' });
        return;
      }

      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');

        const tarot = (await server.ssrLoadModule('/api/_lib/tarot.ts')) as typeof import('./api/_lib/tarot');
        const { question, cards, readingTypeLabel } = tarot.validateReadingRequest(body);
        const result = await tarot.generateReading(apiKey, question, cards, readingTypeLabel);
        respond(200, result);
      } catch (error: any) {
        const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
        console.error('[api/reading]', error);
        respond(status, { error: error?.message || 'Internal error' });
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), readingApiDevPlugin(env.GEMINI_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
