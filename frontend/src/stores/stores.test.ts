import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ProgressStore } from './ProgressStore';
import { DrillStore } from './DrillStore';
import { TranslationStore } from './TranslationStore';
import { localDay, PROGRESS_KEY } from '../storage/local';

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());
describe('progress persistence', () => {
  it('reads legacy progress and records self assessment', () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        done: 5,
        right: 4,
        streak: 2,
        today: localDay(),
        todayCount: 3,
      }),
    );
    const store = new ProgressStore();
    store.record(false);
    expect(store.stats).toMatchObject({
      done: 6,
      right: 4,
      streak: 0,
      todayCount: 4,
    });
    expect(new ProgressStore().stats).toEqual(store.stats);
  });
  it('resets the daily goal at midnight without losing lifetime progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 15, 23, 59));
    const store = new ProgressStore();
    store.record(true);
    vi.setSystemTime(new Date(2026, 9, 16, 0, 1));
    store.refreshDay();
    expect(store.todayCount).toBe(0);
    expect(store.percentage).toBe(0);
    store.record(true);
    expect(store.stats).toMatchObject({ done: 2, todayCount: 1 });
  });
  it('tolerates corrupt or invalid storage and reports write failures', () => {
    localStorage.setItem(PROGRESS_KEY, '{');
    expect(new ProgressStore().problem).toBe('invalid');
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ done: -2, right: '100', todayCount: null }),
    );
    expect(new ProgressStore().problem).toBe('invalid');
    const store = new ProgressStore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    store.record(true);
    expect(store.stats.done).toBe(1);
    expect(store.storageAvailable).toBe(false);
  });
});
describe('drill lifecycle', () => {
  it('counts complete rounds once, including custom random sets and repeated cards', () => {
    const progress = new ProgressStore();
    const store = new DrillStore(progress);
    store.selectTenses(['pastSimple', 'presentPerfect']);
    store.startCustom();
    store.setOrder('random');
    store.next();
    store.jump(0);
    store.next();
    for (let i = 1; i < 6; i++) store.next();
    expect(progress.stats.drills).toBe(1);
    expect(new ProgressStore().stats.drills).toBe(1);
    expect(store.index).toBe(0);
    for (let i = 0; i < 6; i++) store.next();
    expect(progress.stats.drills).toBe(2);
    expect(progress.stats.done).toBe(0);
  });
  it('does not count skipped cards, restarted rounds or changed groups and ordering', () => {
    const progress = new ProgressStore();
    const store = new DrillStore(progress);
    store.jump(store.sequence.length - 1);
    store.next();
    expect(progress.stats.drills).toBe(0);
    store.next();
    store.newRound();
    store.jump(store.sequence.length - 1);
    store.next();
    store.next();
    store.setOrder('random');
    store.jump(store.sequence.length - 1);
    store.next();
    store.next();
    store.setGroup('presentPerfect');
    store.jump(2);
    store.next();
    expect(progress.stats.drills).toBe(0);
  });
  it.each([false, true])(
    'counts automatic rounds with autoReveal=%s and keeps pauses partial',
    (autoReveal) => {
      vi.useFakeTimers();
      const progress = new ProgressStore();
      const store = new DrillStore(progress);
      store.setGroup('presentPerfect');
      store.setSpeed(1);
      store.setAutoReveal(autoReveal);
      store.play();
      vi.advanceTimersByTime(autoReveal ? 3400 : 3000);
      expect(progress.stats.drills).toBe(1);
      store.stop();
      vi.advanceTimersByTime(10000);
      expect(progress.stats.drills).toBe(1);
    },
  );
  it('runs only selected tenses through every form across rounds and ordering changes', () => {
    const store = new DrillStore();
    store.selectTenses(['pastSimple', 'presentPerfect', 'pastSimple']);
    store.startCustom();
    expect(store.sequence).toHaveLength(6);
    const cells = store.sequence
      .map((cell) => `${cell.tense}:${cell.form}`)
      .sort();
    expect(cells).toEqual([
      'pastSimple:neg',
      'pastSimple:pos',
      'pastSimple:q',
      'presentPerfect:neg',
      'presentPerfect:pos',
      'presentPerfect:q',
    ]);
    store.selectTenses([]);
    store.startCustom();
    expect(store.sequence).toHaveLength(6);
    store.setOrder('random');
    store.jump(5);
    store.next();
    expect(store.index).toBe(0);
    expect(
      store.sequence.map((cell) => `${cell.tense}:${cell.form}`).sort(),
    ).toEqual(cells);
    store.newRound();
    expect(store.sequence).toHaveLength(6);
    store.setGroup('simple');
    expect(store.customTenses).toBeNull();
    expect(store.sequence).toHaveLength(9);
  });
  it('stops the previous timer when starting a custom drill', () => {
    vi.useFakeTimers();
    const store = new DrillStore();
    store.play();
    store.toggleTense('futurePerfect');
    store.startCustom();
    expect(store.running).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(store.sequence).toHaveLength(3);
    store.toggleTense('futurePerfect');
    expect(store.selectedTenses).toEqual([]);
    expect(store.customTenses).toEqual(['futurePerfect']);
  });
  it('covers every form, respects groups, and randomizes without losing cells', () => {
    const store = new DrillStore();
    expect(store.sequence).toHaveLength(9);
    store.setGroup('all');
    store.setOrder('random');
    expect(new Set(store.sequence.map((c) => c.tense + c.form)).size).toBe(36);
    store.setGroup('presentPerfect');
    expect(store.sequence).toHaveLength(3);
  });
  it('keeps auto play running across rounds and cancels pending reveals on stop', () => {
    vi.useFakeTimers();
    const store = new DrillStore();
    store.setGroup('presentPerfect');
    store.setSpeed(3);
    store.setAutoReveal(true);
    store.play();
    vi.advanceTimersByTime(15_000);
    expect(store.round).toBeGreaterThan(2);
    expect(store.running).toBe(true);
    store.stop();
    const index = store.index;
    vi.advanceTimersByTime(30_000);
    expect(store.index).toBe(index);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('never immediately repeats a phrase even with a constant random source', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const store = new DrillStore();
    const source = store.source;
    store.newRound();
    expect(store.source).not.toBe(source);
  });
});
describe('translation filters and retries', () => {
  it('only generates requested coordinates and clears incompatible retries', () => {
    const store = new TranslationStore(new ProgressStore());
    store.setGroup('all');
    expect(store.pool).toHaveLength(7560);
    store.setTense('presentPerfect');
    store.setPerson(3);
    store.setForm('q');
    expect(store.current).toMatchObject({
      tense: 'presentPerfect',
      p: 3,
      form: 'q',
    });
    store.reveal();
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    store.mark(false);
    expect(store.queue).toHaveLength(1);
    store.setGroup('simple');
    expect(store.queue).toHaveLength(0);
    expect(store.current.tense).toContain('Simple');
  });
  it('returns failed exercises to the queue and preserves progress when skipping', () => {
    const progress = new ProgressStore();
    const store = new TranslationStore(progress);
    const previous = { ...store.current };
    store.reveal();
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    store.mark(false);
    expect(store.queue).toHaveLength(1);
    expect(progress.stats.done).toBe(1);
    vi.mocked(Math.random).mockReturnValue(0);
    store.next();
    expect(store.current).toEqual(previous);
    expect(progress.stats.done).toBe(1);
    store.setInput(previous.en);
    expect(store.matches).toBe(true);
  });
});
