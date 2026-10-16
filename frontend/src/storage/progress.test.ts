import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressStore } from '../stores/ProgressStore';
import { localDay, PROGRESS_KEY } from './local';
import {
  HISTORY_KEY,
  LEGACY_KEY,
  isDay,
  newProgress,
  parseBackup,
  shiftDay,
  validateProgress,
} from './progress';

const legacy = () =>
  JSON.stringify({
    done: 83,
    right: 61,
    streak: 4,
    today: '2026-10-15',
    todayCount: 12,
  });
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 16, 12));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const snapshots = () =>
  Object.keys(localStorage).filter((key) => key.includes(':backup:'));

describe('lossless progress migration', () => {
  it('preserves v1 bytes, lifetime totals and the one known date, only once', () => {
    localStorage.setItem(PROGRESS_KEY, legacy());
    const store = new ProgressStore();
    expect(store.stats).toMatchObject({
      done: 83,
      right: 61,
      streak: 4,
      drills: 0,
    });
    expect(store.forDay('2026-10-15')).toEqual({
      done: 12,
      right: 0,
      unknown: 12,
      drills: 0,
    });
    expect(store.data.historySince).toBe('2026-10-16');
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(legacy());
    expect(snapshots()).toHaveLength(1);
    expect(localStorage.getItem(snapshots()[0])).toBe(legacy());
    store.record(false);
    store.recordDrill();
    const reloaded = new ProgressStore();
    expect(reloaded.stats).toMatchObject({
      done: 84,
      right: 61,
      streak: 0,
      drills: 1,
    });
    expect(reloaded.data).toEqual(store.data);
    expect(snapshots()).toHaveLength(1);
  });
  it.each(['{', '{"version":3,"totals":{"done":900}}', 'null'])(
    'protects unreadable v2 data %s while allowing in-memory practice',
    (raw) => {
      localStorage.setItem(HISTORY_KEY, raw);
      localStorage.setItem(PROGRESS_KEY, legacy());
      const store = new ProgressStore();
      store.record(true);
      store.recordDrill();
      expect(store.problem).toBe('invalid');
      expect(localStorage.getItem(HISTORY_KEY)).toBe(raw);
      expect(localStorage.getItem(PROGRESS_KEY)).toBe(legacy());
      expect(store.exportOriginal()).toBe(raw);
      expect(parseBackup(store.exportBackup()).totals.done).toBe(1);
    },
  );
  it('does not create v2 if legacy data is invalid', () => {
    const raw = '{"done":-1}';
    localStorage.setItem(PROGRESS_KEY, raw);
    const store = new ProgressStore();
    store.record(true);
    expect(store.problem).toBe('invalid');
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(raw);
  });
  it('does not overwrite anything on read denial, even after access is restored', () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newProgress()));
    const get = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });
    const store = new ProgressStore();
    get.mockRestore();
    store.record(true);
    expect(store.problem).toBe('read');
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!).totals.done).toBe(0);
  });
  it('requires a successful snapshot before migration and retries without losing v1 totals', () => {
    localStorage.setItem(PROGRESS_KEY, legacy());
    const set = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });
    const store = new ProgressStore();
    expect(store.problem).toBe('write');
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    store.record(true);
    set.mockRestore();
    store.record(false);
    expect(store.problem).toBeNull();
    expect(new ProgressStore().stats).toMatchObject({ done: 85, right: 62 });
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(legacy());
    expect(snapshots()).toHaveLength(1);
  });
  it('preserves the session and previous stored data when writes fail', () => {
    const store = new ProgressStore();
    store.record(true);
    const raw = localStorage.getItem(HISTORY_KEY);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    store.record(false);
    expect(store.problem).toBe('write');
    expect(localStorage.getItem(HISTORY_KEY)).toBe(raw);
    expect(parseBackup(store.exportBackup()).totals.done).toBe(2);
    expect(store.reset()).toBe(false);
    expect(store.stats.done).toBe(2);
  });
  it('keeps the migration snapshot if writing v2 fails after backing up v1', () => {
    localStorage.setItem(PROGRESS_KEY, legacy());
    const originalSet = Storage.prototype.setItem;
    const set = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key, raw) {
        if (key === HISTORY_KEY) throw new Error('quota');
        originalSet.call(this, key, raw);
      });
    const store = new ProgressStore();
    expect(store.problem).toBe('write');
    expect(localStorage.getItem(snapshots()[0])).toBe(legacy());
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(legacy());
    set.mockRestore();
    store.recordDrill();
    expect(new ProgressStore().stats).toMatchObject({
      done: 83,
      right: 61,
      drills: 1,
    });
  });
  it('blocks stale tabs from overwriting another tab’s saved practice', () => {
    const first = new ProgressStore();
    const stale = new ProgressStore();
    first.record(true);
    stale.recordDrill();
    expect(stale.problem).toBe('conflict');
    expect(new ProgressStore().stats).toMatchObject({ done: 1, drills: 0 });
    expect(stale.replace(newProgress())).toBe(false);
    expect(new ProgressStore().stats.done).toBe(1);
  });
});

describe('daily history and safe backup replacement', () => {
  it('keeps previous days, failed translations and drills through midnight and reload', () => {
    vi.setSystemTime(new Date(2026, 9, 15, 23, 59));
    const store = new ProgressStore();
    store.record(false);
    store.record(true);
    store.recordDrill();
    vi.setSystemTime(new Date(2026, 9, 16, 0, 1));
    store.refreshDay();
    expect(store.todayCount).toBe(0);
    store.record(true);
    store.recordDrill();
    expect(store.forDay('2026-10-15')).toEqual({
      done: 2,
      right: 1,
      unknown: 0,
      drills: 1,
    });
    expect(new ProgressStore().forDay('2026-10-16')).toEqual({
      done: 1,
      right: 1,
      unknown: 0,
      drills: 1,
    });
    store.selectDay('2026-10-15');
    expect(store.selected.done).toBe(2);
    store.selectDay('2026-10-14');
    expect(store.selected.done).toBe(0);
    store.selectDay('2026-10-99');
    expect(store.viewingDay).toBe('2026-10-14');
  });
  it('round-trips every field and importing twice never adds totals', () => {
    const store = new ProgressStore();
    store.record(true);
    store.recordDrill();
    const exported = store.exportBackup();
    const candidate = store.previewImport(exported);
    store.record(false);
    expect(store.replace(candidate)).toBe(true);
    expect(store.replace(candidate)).toBe(true);
    expect(new ProgressStore().data).toEqual(candidate);
    expect(
      snapshots().some((key) =>
        localStorage.getItem(key)?.includes('"done":2'),
      ),
    ).toBe(true);
    expect(store.stats.done).toBe(1);
  });
  it('explicitly restores old HTML totals without merging or deleting the source', () => {
    localStorage.setItem(LEGACY_KEY, legacy());
    const store = new ProgressStore();
    store.recordDrill();
    const candidate = store.legacyBackup();
    expect(store.stats.drills).toBe(1);
    expect(store.replace(candidate)).toBe(true);
    expect(store.stats).toMatchObject({ done: 83, drills: 0 });
    expect(localStorage.getItem(LEGACY_KEY)).toBe(legacy());
    expect(() => new ProgressStore().legacyBackup()).toThrow('recovered');
    store.reset();
    expect(store.data.legacyRecovered).toBe(true);
  });
  it('backs up even corrupt originals before explicit replacement', () => {
    localStorage.setItem(HISTORY_KEY, '{');
    const store = new ProgressStore();
    expect(store.replace(newProgress())).toBe(true);
    expect(snapshots().some((key) => localStorage.getItem(key) === '{')).toBe(
      true,
    );
    expect(new ProgressStore().problem).toBeNull();
  });
  it('can inspect and restore both raw v1 snapshots and pre-reset v2 session backups', () => {
    localStorage.setItem(PROGRESS_KEY, legacy());
    const store = new ProgressStore();
    const migratedCopy = store.localBackups()[0];
    expect(store.previewLocalBackup(migratedCopy).totals.done).toBe(83);
    store.recordDrill();
    expect(store.reset()).toBe(true);
    const restorable = store
      .localBackups()
      .find((key) => store.readLocalBackup(key).includes('"drills":1'))!;
    expect(store.replace(store.previewLocalBackup(restorable))).toBe(true);
    expect(new ProgressStore().stats).toMatchObject({
      done: 83,
      right: 61,
      drills: 1,
    });
    expect(() => store.readLocalBackup(LEGACY_KEY)).toThrow('missing');
  });
  it('rejects invalid dates, unknown versions and inconsistent counters without mutation', () => {
    const store = new ProgressStore();
    store.record(true);
    const before = localStorage.getItem(HISTORY_KEY);
    for (const value of [
      { ...newProgress(), version: 3 },
      { ...newProgress(), historySince: '2026-02-30' },
      {
        ...newProgress(),
        days: { '2026-10-16': { done: 3, right: 4, unknown: 0, drills: 0 } },
      },
      { ...newProgress(), totals: { done: 1, right: 2, streak: 0, drills: 0 } },
    ]) {
      expect(() => store.previewImport(JSON.stringify(value))).toThrow();
    }
    expect(localStorage.getItem(HISTORY_KEY)).toBe(before);
    expect(isDay('2024-02-29')).toBe(true);
    expect(isDay('2026-02-29')).toBe(false);
    expect(shiftDay('2024-03-01', -1)).toBe('2024-02-29');
    expect(shiftDay(localDay(new Date(2026, 11, 31, 12)), 1)).toBe(
      '2027-01-01',
    );
    expect(validateProgress(store.data).totals.done).toBe(1);
  });
});
