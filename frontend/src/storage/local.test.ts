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
  const app = { ...(await import('./local')), ...(await import('./progress')) };
  expect(app.loadProgress().data.totals.done).toBe(0);
  app.writeText(
    app.HISTORY_KEY,
    JSON.stringify({
      ...app.newProgress(),
      totals: { done: 7, right: 6, streak: 0, drills: 0 },
    }),
  );
  app.writeText(app.THEME_KEY, 'dark');

  vi.stubEnv('VITE_APP_CHANNEL', 'demo');
  vi.resetModules();
  const demo = {
    ...(await import('./local')),
    ...(await import('./progress')),
  };
  expect(demo.loadProgress().data.totals.done).toBe(0);
  expect(demo.readText(demo.THEME_KEY)).toBeNull();
  demo.writeText(
    demo.HISTORY_KEY,
    JSON.stringify({
      ...demo.newProgress(),
      totals: { done: 2, right: 0, streak: 0, drills: 0 },
    }),
  );
  demo.writeText(demo.THEME_KEY, 'light');

  expect(app.loadProgress().data.totals.done).toBe(7);
  expect(app.readText(app.THEME_KEY)).toBe('dark');
  expect(demo.loadProgress().data.totals.done).toBe(2);
  expect(demo.readText(demo.THEME_KEY)).toBe('light');
  expect(localStorage.getItem('tenselab-theme')).toBe('dark');
});

it('isolates each MR preview from other previews and release channels', async () => {
  const channels = ['app', 'demo', 'pr-3', 'pr-4'];
  const stores = [];
  for (const [index, channel] of channels.entries()) {
    vi.stubEnv('VITE_APP_CHANNEL', channel);
    vi.resetModules();
    const storage = {
      ...(await import('./local')),
      ...(await import('./progress')),
    };
    expect(storage.loadProgress().data.totals.done).toBe(0);
    storage.writeText(
      storage.HISTORY_KEY,
      JSON.stringify({
        ...storage.newProgress(),
        totals: { done: index + 1, right: 0, streak: 0, drills: 0 },
      }),
    );
    stores.push(storage);
  }
  expect(
    stores.map((storage) => storage.loadProgress().data.totals.done),
  ).toEqual([1, 2, 3, 4]);
  expect(new Set(stores.map((storage) => storage.THEME_KEY)).size).toBe(4);
});

it('migrates only its own channel and isolates v2 history and backup keys', async () => {
  const channels = ['app', 'demo', 'pr-3', 'pr-4'];
  const stores = [];
  for (const [index, channel] of channels.entries()) {
    vi.stubEnv('VITE_APP_CHANNEL', channel);
    vi.resetModules();
    const storage = await import('./progress');
    const old = await import('./local');
    localStorage.setItem(
      old.PROGRESS_KEY,
      JSON.stringify({
        done: index + 1,
        right: 0,
        streak: 0,
        today: '',
        todayCount: 0,
      }),
    );
    const loaded = storage.loadProgress();
    expect(loaded.problem).toBeNull();
    expect(loaded.data.totals.done).toBe(index + 1);
    expect(
      Object.keys(localStorage).some((key) =>
        key.startsWith(`${old.PROGRESS_KEY}:backup:`),
      ),
    ).toBe(true);
    stores.push(storage);
  }
  expect(
    stores.map((storage) => storage.loadProgress().data.totals.done),
  ).toEqual([1, 2, 3, 4]);
  expect(new Set(stores.map((storage) => storage.HISTORY_KEY)).size).toBe(4);
});
