import { describe, expect, it } from 'vitest';
import { people, times, verbs } from './catalog';
import { formula } from './formulas';
import { eng } from './sentences';
import { forms, type PersonId } from './types';

describe('sentence formulas', () => {
  it('builds the same word order as exercises for every tense, form and person', () => {
    for (const tense of times) {
      for (const form of forms) {
        for (const [index, person] of people.entries()) {
          const verb = verbs[0]; // write / writes / wrote / written / writing
          const substitutions: Record<string, string> = {
            S: person.en,
            V1: verb[0],
            'V-s': verb[1],
            V2: verb[2],
            V3: verb[3],
            'V-ing': verb[4],
          };
          const core = formula(tense.id, form, index as PersonId)
            .map((part) => substitutions[part] ?? part)
            .join(' ')
            .toLowerCase();
          const sentence = eng(tense.id, form, index as PersonId, verb)
            .replace(' already ', ' ')
            .toLowerCase();
          expect(sentence, `${tense.id} ${form} ${person.en}`).toMatch(
            new RegExp(`^${core} `),
          );
        }
      }
    }
  });
  it('keeps person alternatives in the reference and V1 after does / did', () => {
    expect(formula('presentSimple', 'pos')).toEqual(['S', 'V1 / V-s']);
    expect(formula('presentSimple', 'neg', 3)).toEqual([
      'S',
      'does',
      'not',
      'V1',
    ]);
    expect(formula('pastSimple', 'q', 3)).toEqual(['did', 'S', 'V1']);
    expect(formula('futurePerfectContinuous', 'q')).toEqual([
      'will',
      'S',
      'have',
      'been',
      'V-ing',
    ]);
  });
});
