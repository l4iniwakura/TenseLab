import { localDay, PROGRESS_KEY } from './local';

export const CHANNEL = import.meta.env.VITE_APP_CHANNEL ?? 'app';
export const HISTORY_KEY = `tenselab:${CHANNEL}:progress:v2`;
export const LEGACY_KEY = 'tenselab-progress-v1';
export interface DayProgress {
  done: number;
  right: number;
  drills: number;
  // v1 retained a daily count, but no daily correctness breakdown.
  unknown: number;
}
export interface ProgressData {
  version: 2;
  totals: { done: number; right: number; streak: number; drills: number };
  days: Record<string, DayProgress>;
  historySince: string;
  legacyRecovered: boolean;
}
export const emptyDay = (): DayProgress => ({
  done: 0,
  right: 0,
  drills: 0,
  unknown: 0,
});
export const newProgress = (): ProgressData => ({
  version: 2,
  totals: { done: 0, right: 0, streak: 0, drills: 0 },
  days: {},
  historySince: localDay(),
  legacyRecovered: false,
});
export function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(+date) && localDay(date) === value;
}
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/** Reject unknown schemas instead of silently normalizing them to zero. */
export function validateProgress(value: unknown): ProgressData {
  if (
    !object(value) ||
    value.version !== 2 ||
    !object(value.totals) ||
    !object(value.days) ||
    !isDay(value.historySince) ||
    typeof value.legacyRecovered !== 'boolean'
  )
    throw new Error('invalid');
  const totals = value.totals;
  if (
    ![totals.done, totals.right, totals.streak, totals.drills].every(count) ||
    (totals.right as number) > (totals.done as number) ||
    (totals.streak as number) > (totals.right as number)
  )
    throw new Error('invalid');
  let done = 0,
    right = 0,
    drills = 0,
    unknown = 0;
  const days: Record<string, DayProgress> = {};
  for (const [day, entry] of Object.entries(value.days)) {
    if (
      !isDay(day) ||
      !object(entry) ||
      ![entry.done, entry.right, entry.drills, entry.unknown].every(count) ||
      (entry.right as number) + (entry.unknown as number) >
        (entry.done as number)
    )
      throw new Error('invalid');
    const item = entry as unknown as DayProgress;
    days[day] = {
      done: item.done,
      right: item.right,
      drills: item.drills,
      unknown: item.unknown,
    };
    done += item.done;
    right += item.right;
    drills += item.drills;
    unknown += item.unknown;
  }
  if (
    ![done, right, drills, unknown].every(count) ||
    done > (totals.done as number) ||
    right > (totals.right as number) ||
    drills > (totals.drills as number) ||
    done - right - unknown > (totals.done as number) - (totals.right as number)
  )
    throw new Error('invalid');
  return {
    version: 2,
    totals: {
      done: totals.done as number,
      right: totals.right as number,
      streak: totals.streak as number,
      drills: totals.drills as number,
    },
    days,
    historySince: value.historySince,
    legacyRecovered: value.legacyRecovered,
  };
}

export function migrateV1(raw: string): ProgressData {
  const value: unknown = JSON.parse(raw);
  if (
    !object(value) ||
    'version' in value ||
    ![value.done, value.right, value.streak, value.todayCount].every(count) ||
    (value.right as number) > (value.done as number) ||
    (value.streak as number) > (value.right as number) ||
    (value.todayCount as number) > (value.done as number) ||
    (value.today !== '' && !isDay(value.today))
  )
    throw new Error('invalid');
  const data = newProgress();
  data.totals = {
    done: value.done as number,
    right: value.right as number,
    streak: value.streak as number,
    drills: 0,
  };
  if (isDay(value.today) && value.todayCount) {
    data.days[value.today] = {
      ...emptyDay(),
      done: value.todayCount as number,
      unknown: value.todayCount as number,
    };
  }
  return data;
}

/** A backup must succeed before any migration or explicit replacement. Originals stay intact. */
export function backupRaw(key: string, raw: string) {
  localStorage.setItem(
    `${key}:backup:${new Date().toISOString()}:${crypto.randomUUID()}`,
    raw,
  );
}
export type StorageProblem = 'read' | 'invalid' | 'write' | 'conflict' | null;
export function loadProgress(): {
  data: ProgressData;
  raw: string | null;
  problem: StorageProblem;
} {
  let raw: string | null;
  let old: string | null;
  try {
    raw = localStorage.getItem(HISTORY_KEY);
    old = raw === null ? localStorage.getItem(PROGRESS_KEY) : null;
  } catch {
    return { data: newProgress(), raw: null, problem: 'read' };
  }
  try {
    if (raw !== null)
      return { data: validateProgress(JSON.parse(raw)), raw, problem: null };
    if (old === null) return { data: newProgress(), raw: null, problem: null };
    const data = migrateV1(old);
    try {
      backupRaw(PROGRESS_KEY, old);
      const nextRaw = JSON.stringify(data);
      localStorage.setItem(HISTORY_KEY, nextRaw);
      return { data, raw: nextRaw, problem: null };
    } catch {
      return { data, raw: null, problem: 'write' };
    }
  } catch {
    return { data: newProgress(), raw, problem: 'invalid' };
  }
}

export function parseBackup(text: string): ProgressData {
  const value: unknown = JSON.parse(text);
  if (object(value) && value.format === 'tenselab-progress')
    return validateProgress(value.data);
  return validateProgress(value);
}

/** Calendar arithmetic uses local noon, including DST changes. */
export function shiftDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return localDay(date);
}
