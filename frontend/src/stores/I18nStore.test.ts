import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectLocale,
  I18nStore,
  resources,
  translate,
  type UiLocale,
} from './I18nStore';
import { RootStore } from './RootStore';
import { LOCALE_KEY, PROGRESS_KEY, THEME_KEY } from '../storage/local';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
const variants = (message: string | object) =>
  typeof message === 'string'
    ? [message]
    : (Object.values(message) as string[]);
const parameters = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('UI locale contract', () => {
  it('ships matching keys, interpolation parameters and required plural categories', () => {
    for (const locale of Object.keys(resources) as UiLocale[]) {
      expect(Object.keys(resources[locale]).sort()).toEqual(
        Object.keys(resources.ru).sort(),
      );
      for (const [key, message] of Object.entries(resources[locale])) {
        const expected = parameters(variants(resources.ru[key])[0]);
        for (const text of variants(message)) {
          expect(text.trim(), `${locale}:${key}`).not.toBe('');
          expect(parameters(text), `${locale}:${key}`).toEqual(expected);
        }
        if (typeof message !== 'string') {
          for (const category of new Intl.PluralRules(locale).resolvedOptions()
            .pluralCategories) {
            expect(
              message[category],
              `${locale}:${key}:${category}`,
            ).toBeTruthy();
          }
        }
      }
    }
  });
  it('detects browser languages in order and safely defaults to Russian', () => {
    expect(detectLocale(['fr-FR', 'de-AT', 'en-US'])).toBe('de');
    expect(detectLocale(['EN-gb'])).toBe('en');
    expect(detectLocale(['zh', 'fr'])).toBe('ru');
    localStorage.setItem(LOCALE_KEY, 'invalid');
    expect(new I18nStore(['en']).uiLocale).toBe('en');
  });
  it('persists explicit choices with the environment key and survives denied storage', () => {
    const store = new I18nStore(['en']);
    store.setLocale('de');
    expect(new I18nStore(['ru']).uiLocale).toBe('de');
    expect(localStorage.getItem(LOCALE_KEY)).toBe('de');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const blocked = new I18nStore(['ru']);
    blocked.setLocale('en');
    expect(blocked.t('nav.drill')).toBe('Quick drill');
  });
  it('falls back safely and supports locale-specific numbers, dates and plurals', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(translate('de', 'nav.drill', {}, { ...resources, de: {} })).toBe(
      'Быстрый дрилл',
    );
    expect(translate('en', 'unknown.key')).toBe('unknown.key');
    expect(warn).toHaveBeenCalled();
    expect(translate('ru', 'count.seconds', { count: 1 })).toBe('1 секунда');
    expect(translate('ru', 'count.seconds', { count: 3 })).toBe('3 секунды');
    expect(translate('ru', 'count.seconds', { count: 5 })).toBe('5 секунд');
    const store = new I18nStore(['de']);
    expect(store.number(1234)).toBe('1.234');
    expect(
      store.date(new Date(2026, 9, 15), {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }),
    ).toBe('15.10.2026');
  });
  it('switches UI without mutating learning state and translates existing store messages', () => {
    const root = new RootStore();
    root.drill.selectTenses(['pastPerfect']);
    root.drill.startCustom();
    root.drill.jump(1);
    root.translation.setInput('My own answer');
    root.translation.reveal();
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    root.translation.mark(false);
    root.translation.setInput('Keep me');
    root.toggleTheme();
    root.speechError();
    const snapshot = JSON.stringify({
      drill: root.drill,
      translation: root.translation,
    });
    const progress = localStorage.getItem(PROGRESS_KEY);
    const theme = localStorage.getItem(THEME_KEY);
    root.i18n.setLocale('de');
    expect(root.message).toContain('Der Satz');
    expect(
      JSON.stringify({ drill: root.drill, translation: root.translation }),
    ).toBe(snapshot);
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(progress);
    expect(localStorage.getItem(THEME_KEY)).toBe(theme);
    expect(root.i18n.contentLocale).toBe('ru');
    expect(root.i18n.targetLanguage).toBe('en');
  });
});
