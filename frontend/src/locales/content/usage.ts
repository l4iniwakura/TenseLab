import ru from './ru/usage.json';
import en from './en/usage.json';
import de from './de/usage.json';
import type { TenseId } from '../../domain/types';

export interface UsageTranslation {
  situations: Record<
    string,
    {
      title: string;
      context: string;
      examples: Record<string, { translation: string; explanation: string }>;
    }
  >;
  contrast: { first: string; second: string; explanation: string };
  note?: string;
}
export const usagePacks: Record<string, Record<TenseId, UsageTranslation>> = {
  ru,
  en,
  de,
};
export function usageContent(locale: string, tense: TenseId): UsageTranslation {
  const pack = Object.hasOwn(usagePacks, locale)
    ? usagePacks[locale]
    : usagePacks.ru;
  return pack[tense];
}
