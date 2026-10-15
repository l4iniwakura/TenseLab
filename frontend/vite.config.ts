import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const channel =
    loadEnv(mode, process.cwd(), 'VITE_').VITE_APP_CHANNEL ?? 'app';
  if (!/^(app|demo|pr-[1-9]\d*)$/.test(channel)) {
    throw new Error('VITE_APP_CHANNEL must be app, demo or pr-<number>');
  }
  const base = `/TenseLab/${channel}/`;
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        base,
        scope: base,
        // Preview reloads should show the deployed commit without an old SW.
        disable: channel.startsWith('pr-'),
        registerType: 'prompt',
        manifest: false,
        workbox: {
          cacheId: `tenselab-${channel}`,
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,svg}'],
          navigateFallback: 'index.html',
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  };
});
