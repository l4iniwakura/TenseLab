const channel = import.meta.env.VITE_APP_CHANNEL ?? 'app';
export const PROGRESS_KEY = `tenselab:${channel}:progress:v1`;
export const LOCALE_KEY = `tenselab:${channel}:uiLocale`;
export const THEME_KEY = `tenselab:${channel}:theme`;
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
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
