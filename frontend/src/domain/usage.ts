import originals from './usage-originals.json';
import type { TenseId } from './types';

export interface UsageSituation {
  id: string;
  examples: { id: string; english: string }[];
}
export interface UsageLesson {
  situations: UsageSituation[];
  contrast: { first: string; second: string };
}
/** English learning originals: stable tense/situation/example IDs, no UI text. */
export const usageLessons: Record<TenseId, UsageLesson> = originals;
