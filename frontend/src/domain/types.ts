export type Aspect = 'simple' | 'continuous' | 'perfect' | 'perfectContinuous';
export type TenseId =
  `${'present' | 'past' | 'future'}${'Simple' | 'Continuous' | 'Perfect' | 'PerfectContinuous'}`;
export type GroupId = Aspect | 'all' | 'presentPerfect';
export type Form = 'pos' | 'neg' | 'q';
export type PersonId = 0 | 1 | 2 | 3 | 4 | 5;
export interface Verb {
  base: string;
  thirdPerson: string;
  past: string;
  participle: string;
  ing: string;
  ruInfinitive: string;
  ruPresent: [string, string, string, string, string, string];
  ruPast: { masculine: string; feminine: string; plural: string };
  ruObject: string;
  object: string;
}
export interface Tense {
  id: TenseId;
  label: string;
  cat: Aspect;
  exp: string;
  cue: string;
  rus: string;
}
export interface Group {
  ids: TenseId[];
}
export interface Exercise {
  tense: TenseId;
  form: Form;
  p: PersonId;
  vi: number;
  en: string;
  ru: string;
}
export type Section = 'drill' | 'translation' | 'reference' | 'progress';
export const forms: Form[] = ['pos', 'neg', 'q'];
export const formSigns: Record<Form, string> = { pos: '+', neg: '−', q: '?' };
