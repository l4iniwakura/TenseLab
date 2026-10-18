import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { times } from './catalog';
import { example } from './sentences';
import { forms, type PersonId } from './types';
import { normalize } from './answers';

describe('legacy migration contract', () => {
  it('preserves all 7,344 Russian and English generated combinations', () => {
    const html = readFileSync(
      resolve(process.cwd(), '../old/index.html'),
      'utf8',
    );
    const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
    const data = script.slice(0, script.indexOf('let view='));
    const functions = script.slice(
      script.indexOf('function eng('),
      script.indexOf('const titleNames='),
    );
    const legacy = runInNewContext(
      `${data}\n${functions}\nexample`,
    ) as typeof example;
    let count = 0;
    for (const tense of times)
      for (const form of forms)
        for (let p = 0; p < 6; p++)
          for (let vi = 0; vi < 34; vi++) {
            const actual = example(tense.id, form, p as PersonId, vi);
            const previous = legacy(tense.id, form, p as PersonId, vi);
            expect(actual.en).toBe(previous.en);
            expect(actual.ru).toBe(previous.ru);
            count++;
          }
    expect(count).toBe(7344);
  });
  it('accepts contractions, punctuation, extra spaces and curly apostrophes', () => {
    expect(normalize('  I don’t write a report. ')).toBe(
      normalize('I do not write a report'),
    );
    expect(normalize("She hasn't checked it yet!")).toBe(
      'she has not checked it yet',
    );
    expect(normalize('Will you read?')).toBe('will you read');
  });
});
