export type Aspect = 'simple' | 'continuous' | 'perfect' | 'perfectContinuous';
export type TenseId =
  `${'present' | 'past' | 'future'}${'Simple' | 'Continuous' | 'Perfect' | 'PerfectContinuous'}`;
export type GroupId = Aspect | 'all' | 'presentPerfect';
export type Form = 'pos' | 'neg' | 'q';
export type PersonId = 0 | 1 | 2 | 3 | 4 | 5;
export type Verb = [
  string,
  string,
  string,
  string,
  string,
  string,
  [string, string, string, string, string, string],
  [string, string, string],
  string,
  string,
];
export interface Tense {
  id: TenseId;
  label: string;
  cat: Aspect;
  exp: string;
  cue: string;
  rus: string;
}
export interface Group {
  name: string;
  desc: string;
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
export const formNames: Record<Form, string> = {
  pos: 'Утверждение',
  neg: 'Отрицание',
  q: 'Вопрос',
};
export const formSigns: Record<Form, string> = { pos: '+', neg: '−', q: '?' };
