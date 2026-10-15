import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('keeps demo progress and theme separate from app and legacy data', async () => {
  localStorage.setItem('tenselab-progress-v1', JSON.stringify({ done: 99 }));
  localStorage.setItem('tenselab-theme', 'dark');
  vi.stubEnv('VITE_APP_CHANNEL', 'app');
  vi.resetModules();
  const app = await import('./local');
  expect(app.readProgress().done).toBe(0);
  app.writeText(app.PROGRESS_KEY, JSON.stringify({ done: 7, right: 6 }));
  app.writeText(app.THEME_KEY, 'dark');

  vi.stubEnv('VITE_APP_CHANNEL', 'demo');
  vi.resetModules();
  const demo = await import('./local');
  expect(demo.readProgress().done).toBe(0);
  expect(demo.readText(demo.THEME_KEY)).toBeNull();
  demo.writeText(demo.PROGRESS_KEY, JSON.stringify({ done: 2 }));
  demo.writeText(demo.THEME_KEY, 'light');

  expect(app.readProgress().done).toBe(7);
  expect(app.readText(app.THEME_KEY)).toBe('dark');
  expect(demo.readProgress().done).toBe(2);
  expect(demo.readText(demo.THEME_KEY)).toBe('light');
  expect(localStorage.getItem('tenselab-theme')).toBe('dark');
});
