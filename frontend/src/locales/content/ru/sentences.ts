import { people } from './catalog';
import type { TenseId, Form, PersonId, Verb } from '../../../domain/types';

const leads: Record<TenseId, string> = {
  presentSimple: 'Обычно',
  pastSimple: 'Вчера',
  futureSimple: 'Завтра',
  presentContinuous: 'Прямо сейчас',
  pastContinuous: 'Вчера в это время',
  futureContinuous: 'Завтра в это время',
  presentPerfect: 'К настоящему моменту',
  pastPerfect: 'К тому моменту',
  futurePerfect: 'К завтрашнему вечеру',
  presentPerfectContinuous: 'Уже два часа',
  pastPerfectContinuous: 'К тому моменту уже два часа',
  futurePerfectContinuous: 'К завтрашнему вечеру уже два часа',
};
export function russian(
  tense: TenseId,
  form: Form,
  person: PersonId,
  verb: Verb,
): string {
  const subject = people[person].ru;
  const past =
    verb.ruPast[
      person === 3 ? 'feminine' : person >= 4 ? 'plural' : 'masculine'
    ];
  const isPresent = [
    'presentSimple',
    'presentContinuous',
    'presentPerfectContinuous',
  ].includes(tense);
  const isPast = [
    'pastSimple',
    'pastContinuous',
    'pastPerfect',
    'pastPerfectContinuous',
  ].includes(tense);
  let conjugated = isPresent
    ? verb.ruPresent[person]
    : isPast
      ? past
      : `${['буду', 'будешь', 'будет', 'будет', 'будем', 'будут'][person]} ${verb.ruInfinitive}`;
  if (tense === 'presentPerfect' || tense === 'pastPerfect') conjugated = past;
  if (tense === 'futurePerfect')
    conjugated = `${['успею', 'успеешь', 'успеет', 'успеет', 'успеем', 'успеют'][person]} ${verb.ruInfinitive}`;
  const perfect = tense === 'presentPerfect' || tense === 'pastPerfect';
  const modifier = perfect
    ? form === 'neg'
      ? 'ещё не '
      : 'уже '
    : form === 'neg'
      ? 'не '
      : '';
  const statement = `${subject} ${form === 'q' ? (perfect ? 'уже ' : '') : modifier}${conjugated} ${verb.ruObject}`;
  return `${leads[tense]} ${statement[0].toLowerCase()}${statement.slice(1)}${form === 'q' ? '?' : '.'}`;
}
