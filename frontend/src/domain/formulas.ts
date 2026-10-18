import { people } from './catalog';
import type { Form, PersonId, TenseId } from './types';

// S = subject; V1, V2, V3 = base, past and past participle forms.
export function formula(
  tense: TenseId,
  form: Form,
  person?: PersonId,
): string[] {
  const third = person !== undefined && people[person].thirdPerson;
  const generic = person === undefined;
  const presentBe = generic
    ? 'am / is / are'
    : person === 0
      ? 'am'
      : third
        ? 'is'
        : 'are';
  const pastBe = generic
    ? 'was / were'
    : person === 0 || third
      ? 'was'
      : 'were';
  const have = generic ? 'have / has' : third ? 'has' : 'have';
  const doVerb = generic ? 'do / does' : third ? 'does' : 'do';
  const structures: Record<TenseId, [string[], string]> = {
    presentSimple: [[doVerb], 'V1'],
    pastSimple: [['did'], 'V1'],
    futureSimple: [['will'], 'V1'],
    presentContinuous: [[presentBe], 'V-ing'],
    pastContinuous: [[pastBe], 'V-ing'],
    futureContinuous: [['will', 'be'], 'V-ing'],
    presentPerfect: [[have], 'V3'],
    pastPerfect: [['had'], 'V3'],
    futurePerfect: [['will', 'have'], 'V3'],
    presentPerfectContinuous: [[have, 'been'], 'V-ing'],
    pastPerfectContinuous: [['had', 'been'], 'V-ing'],
    futurePerfectContinuous: [['will', 'have', 'been'], 'V-ing'],
  };
  const [aux, verb] = structures[tense];
  const [first, ...rest] = aux;
  if (form === 'q') return [first, 'S', ...rest, verb];
  if (form === 'neg') return ['S', first, 'not', ...rest, verb];
  if (tense === 'presentSimple')
    return ['S', generic ? 'V1 / V-s' : third ? 'V-s' : 'V1'];
  if (tense === 'pastSimple') return ['S', 'V2'];
  return ['S', ...aux, verb];
}
