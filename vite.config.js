import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In `npm run dev`, serve /api/chat and /api/status through the same handlers Vercel runs in
// production, so the agent can be tried locally with a key in .env.local.
function devApi(env) {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const k of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'ALLOWED_ORIGINS']) {
        if (env[k] && !process.env[k]) process.env[k] = env[k];
      }
      for (const route of ['chat', 'status']) {
        server.middlewares.use(`/api/${route}`, async (req, res, next) => {
          try {
            const mod = await server.ssrLoadModule(`/api/${route}.js`);
            await mod.default(req, res);
          } catch (err) {
            next(err);
          }
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Empty prefix loads every var, but only into this Node process — nothing
  // without a VITE_ prefix is ever exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devApi(env)],
    build: { sourcemap: false },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
    },
  };
});
