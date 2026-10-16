import ru from './ru/reference.json';
import en from './en/reference.json';
import de from './de/reference.json';
import type { Form, GroupId, TenseId } from '../../domain/types';

interface ReferenceContent {
  tenseDescriptions: Record<TenseId, string>;
  groupDescriptions: Record<GroupId, string>;
  learning: typeof ru.learning;
  tableTranslations: Partial<Record<TenseId, Record<Form, string>>>;
}
export const referencePacks: Record<string, ReferenceContent> = { ru, en, de };
/** Reference explanations follow the UI; translation exercises retain their own content locale. */
export function referenceContent(locale: string): ReferenceContent {
  return Object.hasOwn(referencePacks, locale)
    ? referencePacks[locale]
    : referencePacks.ru;
}
