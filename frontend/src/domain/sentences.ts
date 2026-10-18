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
    presentSimple: [[thirdPerson ? 'does' : 'do'], verb.base],
    pastSimple: [['did'], verb.base],
    futureSimple: [['will'], verb.base],
    presentContinuous: [[be], verb.ing],
    pastContinuous: [[was], verb.ing],
    futureContinuous: [['will', 'be'], verb.ing],
    presentPerfect: [[has], verb.participle],
    pastPerfect: [['had'], verb.participle],
    futurePerfect: [['will', 'have'], verb.participle],
    presentPerfectContinuous: [[has, 'been'], verb.ing],
    pastPerfectContinuous: [['had', 'been'], verb.ing],
    futurePerfectContinuous: [['will', 'have', 'been'], verb.ing],
  };
  const [auxiliaries, mainVerb] = structures[tense];
  const [first, ...rest] = auxiliaries;
  let words: string[];
  if (form === 'q') words = [first, subject, ...rest, mainVerb, verb.object];
  else if (form === 'neg')
    words = [subject, first, 'not', ...rest, mainVerb, verb.object];
  else if (tense === 'presentSimple')
    words = [subject, thirdPerson ? verb.thirdPerson : verb.base, verb.object];
  else if (tense === 'pastSimple') words = [subject, verb.past, verb.object];
  else if (tense === 'presentPerfect')
    words = [subject, first, 'already', mainVerb, verb.object];
  else words = [subject, ...auxiliaries, mainVerb, verb.object];
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
