import { makeAutoObservable } from 'mobx';
import { LOCALE_KEY, readText, writeText } from '../storage/local';
import ru from '../locales/ui/ru.json';
import en from '../locales/ui/en.json';
import de from '../locales/ui/de.json';

export const uiLocales = [
  { id: 'ru', name: 'Русский' },
  { id: 'en', name: 'English' },
  { id: 'de', name: 'Deutsch' },
] as const;
export type UiLocale = (typeof uiLocales)[number]['id'];
export type UiKey = keyof typeof ru;
type Message = string | Partial<Record<Intl.LDMLPluralRule, string>>;
export type Messages = Record<string, Message>;
export const resources: Record<UiLocale, Messages> = { ru, en, de };
export const defaultLocale: UiLocale = 'ru';

export function isUiLocale(value: unknown): value is UiLocale {
  return uiLocales.some(({ id }) => id === value);
}
export function detectLocale(languages: readonly string[]): UiLocale {
  for (const language of languages) {
    const base = language.toLowerCase().split(/[-_]/)[0];
    if (isUiLocale(base)) return base;
  }
  return defaultLocale;
}

/** Pure translator shared by React and stores. Values are rendered as text, never HTML. */
export function translate(
  locale: UiLocale,
  key: string,
  params: Record<string, string | number> = {},
  catalogs = resources,
): string {
  let messageLocale = locale;
  let message = Object.hasOwn(catalogs[locale], key)
    ? catalogs[locale][key]
    : undefined;
  if (!message) {
    if (import.meta.env.DEV)
      console.warn(`Missing UI translation: ${locale}:${key}`);
    messageLocale = defaultLocale;
    message = Object.hasOwn(catalogs[defaultLocale], key)
      ? catalogs[defaultLocale][key]
      : key;
  }
  const template =
    typeof message === 'string'
      ? message
      : (message[
          new Intl.PluralRules(messageLocale).select(Number(params.count))
        ] ??
        message.other ??
        key);
  return template.replace(/\{(\w+)\}/g, (token, name: string) => {
    const value = params[name];
    return typeof value === 'number'
      ? new Intl.NumberFormat(locale).format(value)
      : (value ?? token);
  });
}

export class I18nStore {
  uiLocale: UiLocale;
  // Learning content has its own boundary; changing UI language never changes exercises.
  readonly targetLanguage = 'en';
  readonly contentLocale = 'ru';
  constructor(languages: readonly string[] = navigator.languages) {
    const saved = readText(LOCALE_KEY);
    this.uiLocale = isUiLocale(saved) ? saved : detectLocale(languages);
    makeAutoObservable(
      this,
      { targetLanguage: false, contentLocale: false },
      { autoBind: true },
    );
  }
  setLocale(locale: UiLocale) {
    this.uiLocale = locale;
    writeText(LOCALE_KEY, locale);
  }
  t(key: UiKey, params?: Record<string, string | number>) {
    return translate(this.uiLocale, key, params);
  }
  number(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(this.uiLocale, options).format(value);
  }
  date(value: Date, options?: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat(this.uiLocale, options).format(value);
  }
}
