export interface Progress {
  done: number;
  right: number;
  streak: number;
  today: string;
  todayCount: number;
}
const channel = import.meta.env.VITE_APP_CHANNEL ?? 'app';
export const PROGRESS_KEY = `tenselab:${channel}:progress:v1`;
export const THEME_KEY = `tenselab:${channel}:theme`;
export function emptyProgress(): Progress {
  return { done: 0, right: 0, streak: 0, today: '', todayCount: 0 };
}
export function readText(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeText(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(readText(PROGRESS_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return emptyProgress();
    const data = value as Record<string, unknown>;
    const count = (key: string) =>
      typeof data[key] === 'number' &&
      Number.isSafeInteger(data[key]) &&
      (data[key] as number) >= 0
        ? (data[key] as number)
        : 0;
    const done = count('done');
    return {
      done,
      right: Math.min(done, count('right')),
      streak: Math.min(done, count('streak')),
      today: typeof data.today === 'string' ? data.today : '',
      todayCount: count('todayCount'),
    };
  } catch {
    return emptyProgress();
  }
}
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
