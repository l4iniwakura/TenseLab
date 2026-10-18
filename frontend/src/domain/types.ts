export type Aspect = 'simple' | 'continuous' | 'perfect' | 'perfectContinuous';
export type TenseId =
  `${'present' | 'past' | 'future'}${'Simple' | 'Continuous' | 'Perfect' | 'PerfectContinuous'}`;
export type GroupId = Aspect | 'all' | 'presentPerfect';
export type Form = 'pos' | 'neg' | 'q';
export type PronounId = 0 | 1 | 2 | 3 | 4 | 5;
export type PersonId = PronounId | 6 | 7 | 8 | 9;
export type PastGender = 'masculine' | 'feminine' | 'neuter' | 'plural';
export interface Person {
  en: string;
  ru: string;
  p: PersonId;
  pronoun: PronounId;
  thirdPerson: boolean;
  pastGender: PastGender;
}
export interface Verb {
  base: string;
  thirdPerson: string;
  past: string;
  participle: string;
  ing: string;
  ruInfinitive: string;
  ruPresent: [string, string, string, string, string, string];
  ruPast: Record<PastGender, string>;
  ruPerfect?: { infinitive: string; past: Record<PastGender, string> };
  subjects?: readonly PersonId[];
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
