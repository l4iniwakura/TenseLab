// Preserve the original language output. Linguistic content corrections are separate.
import { russian } from '../locales/content/ru/sentences';
export { russian } from '../locales/content/ru/sentences';
import { people, verbs } from './catalog';
import type { TenseId, Form, PersonId, Verb, Exercise } from './types';

const markers: Record<TenseId, string> = {
  presentSimple: 'every day',
  pastSimple: 'yesterday',
  futureSimple: 'tomorrow',
  presentContinuous: 'right now',
  pastContinuous: 'at this time yesterday',
  futureContinuous: 'at this time tomorrow',
  presentPerfect: 'already',
  pastPerfect: 'by then',
  futurePerfect: 'by tomorrow evening',
  presentPerfectContinuous: 'for two hours',
  pastPerfectContinuous: 'for two hours by then',
  futurePerfectContinuous: 'for two hours by tomorrow evening',
};
export function eng(
  tense: TenseId,
  form: Form,
  person: PersonId,
  verb: Verb,
): string {
  const subject = people[person].en;
  const thirdPerson = person === 2 || person === 3;
  const has = thirdPerson ? 'has' : 'have';
  const be = person === 0 ? 'am' : thirdPerson ? 'is' : 'are';
  const was = person === 0 || thirdPerson ? 'was' : 'were';
  const structures: Record<TenseId, [string[], string]> = {
    presentSimple: [[thirdPerson ? 'does' : 'do'], verb[0]],
    pastSimple: [['did'], verb[0]],
    futureSimple: [['will'], verb[0]],
    presentContinuous: [[be], verb[4]],
    pastContinuous: [[was], verb[4]],
    futureContinuous: [['will', 'be'], verb[4]],
    presentPerfect: [[has], verb[3]],
    pastPerfect: [['had'], verb[3]],
    futurePerfect: [['will', 'have'], verb[3]],
    presentPerfectContinuous: [[has, 'been'], verb[4]],
    pastPerfectContinuous: [['had', 'been'], verb[4]],
    futurePerfectContinuous: [['will', 'have', 'been'], verb[4]],
  };
  const [auxiliaries, mainVerb] = structures[tense];
  const [first, ...rest] = auxiliaries;
  let words: string[];
  if (form === 'q') words = [first, subject, ...rest, mainVerb, verb[9]];
  else if (form === 'neg')
    words = [subject, first, 'not', ...rest, mainVerb, verb[9]];
  else if (tense === 'presentSimple')
    words = [subject, thirdPerson ? verb[1] : verb[0], verb[9]];
  else if (tense === 'pastSimple') words = [subject, verb[2], verb[9]];
  else if (tense === 'presentPerfect')
    words = [subject, first, 'already', mainVerb, verb[9]];
  else words = [subject, ...auxiliaries, mainVerb, verb[9]];
  const suffix =
    tense === 'presentPerfect' ? (form === 'pos' ? '' : 'yet') : markers[tense];
  const sentence = [...words, ...(suffix ? [suffix] : [])].join(' ');
  return (
    sentence[0].toUpperCase() + sentence.slice(1) + (form === 'q' ? '?' : '.')
  );
}
export function example(
  tense: TenseId,
  form: Form,
  p: PersonId = 0,
  vi = 0,
): Exercise {
  const verb = verbs[vi];
  return {
    tense,
    form,
    p,
    vi,
    en: eng(tense, form, p, verb),
    ru: russian(tense, form, p, verb),
  };
}
