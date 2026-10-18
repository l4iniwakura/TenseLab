import { afterEach, describe, expect, it, vi } from 'vitest';
import { people, times, verbs } from './catalog';
import { phrases } from './phrases';
import { eng, example } from './sentences';
import { forms, type PersonId, type TenseId } from './types';
import { DrillStore } from '../stores/DrillStore';
import { ProgressStore } from '../stores/ProgressStore';
import { TranslationStore } from '../stores/TranslationStore';

afterEach(() => vi.restoreAllMocks());

describe('reviewed inanimate practice', () => {
  it('retains every old phrase and only adds six explicitly compatible pairs', () => {
    expect(phrases.filter(({ person }) => person < 6)).toHaveLength(204);
    expect(
      phrases
        .filter(({ person }) => person >= 6)
        .map(({ person, verbIndex }) => [
          people[person].en,
          verbs[verbIndex].base,
        ]),
    ).toEqual([
      ['it', 'process'],
      ['it', 'travel'],
      ['it', 'charge'],
      ['the computer', 'process'],
      ['the train', 'travel'],
      ['the phone', 'charge'],
    ]);
    for (const phrase of phrases.filter(({ person }) => person >= 6)) {
      for (const tense of times)
        for (const form of forms) {
          const value = example(
            tense.id,
            form,
            phrase.person,
            phrase.verbIndex,
          );
          expect(value.en).not.toMatch(/undefined|NaN/);
          expect(value.ru).not.toMatch(/undefined|NaN/);
        }
    }
  });
  it.each([
    [
      'presentSimple',
      [
        'The computer processes data every day.',
        'The computer does not process data every day.',
        'Does the computer process data every day?',
      ],
    ],
    [
      'presentContinuous',
      [
        'The computer is processing data right now.',
        'The computer is not processing data right now.',
        'Is the computer processing data right now?',
      ],
    ],
    [
      'pastContinuous',
      [
        'The computer was processing data at this time yesterday.',
        'The computer was not processing data at this time yesterday.',
        'Was the computer processing data at this time yesterday?',
      ],
    ],
    [
      'presentPerfect',
      [
        'The computer has already processed data.',
        'The computer has not processed data yet.',
        'Has the computer processed data yet?',
      ],
    ],
  ] as [TenseId, string[]][])(
    'agrees in all three forms of %s',
    (tense, expected) => {
      const verb = verbs.find((verb) => verb.base === 'process')!;
      expect(forms.map((form) => eng(tense, form, 7, verb))).toEqual(expected);
    },
  );
  it('uses matching Russian gender and completed aspect for new subjects', () => {
    const process = verbs.findIndex((verb) => verb.base === 'process');
    const charge = verbs.findIndex((verb) => verb.base === 'charge');
    expect(example('presentPerfect', 'pos', 6, process).ru).toBe(
      'К настоящему моменту оно уже обработало данные.',
    );
    expect(example('presentPerfect', 'pos', 7, process).ru).toBe(
      'К настоящему моменту компьютер уже обработал данные.',
    );
    expect(example('futurePerfect', 'pos', 9, charge).ru).toBe(
      'К завтрашнему вечеру телефон успеет зарядиться на столе.',
    );
  });
  it('reaches each new subject in normal drills and retains translation filters/retries', () => {
    localStorage.clear();
    const drill = new DrillStore();
    for (const person of [6, 7, 8, 9] as PersonId[]) {
      drill.person = 0;
      drill.verbIndex = 0;
      const index = phrases.findIndex((phrase) => phrase.person === person);
      vi.spyOn(Math, 'random').mockReturnValue(
        (index - 0.5) / (phrases.length - 1),
      );
      drill.newRound();
      expect(drill.person).toBe(person);
      expect(drill.answer).toBe(
        eng(
          drill.current.tense,
          drill.current.form,
          person,
          verbs[drill.verbIndex],
        ),
      );
      const trainer = new TranslationStore(new ProgressStore());
      trainer.setGroup('all');
      trainer.setPerson(person);
      trainer.setTense('presentPerfect');
      trainer.setForm('q');
      expect(trainer.pool.length).toBeGreaterThan(0);
      expect(
        trainer.pool.every(
          ([tense, form, p]) =>
            tense === 'presentPerfect' && form === 'q' && p === person,
        ),
      ).toBe(true);
      const original = { ...trainer.current };
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      trainer.reveal();
      trainer.mark(false);
      vi.spyOn(Math, 'random').mockReturnValue(0);
      trainer.next();
      expect(trainer.current).toEqual(original);
      trainer.setPerson(0);
      expect(trainer.queue).toHaveLength(0);
    }
  });
});
