import { describe, expect, it } from 'vitest';
import { times } from './catalog';
import { usageLessons } from './usage';
import { usageContent, usagePacks } from '../locales/content/usage';
import { referencePacks } from '../locales/content/reference';

const hasCyrillic = /[А-Яа-яЁё]/;
describe('everyday tense learning content', () => {
  it('covers all 12 stable tense IDs with distinct situations and examples', () => {
    expect(Object.keys(usageLessons).sort()).toEqual(
      times.map(({ id }) => id).sort(),
    );
    const english = [];
    for (const lesson of Object.values(usageLessons)) {
      expect(lesson.situations.length).toBeGreaterThanOrEqual(2);
      expect(new Set(lesson.situations.map(({ id }) => id)).size).toBe(
        lesson.situations.length,
      );
      for (const situation of lesson.situations) {
        expect(situation.examples.length).toBeGreaterThanOrEqual(2);
        expect(new Set(situation.examples.map(({ id }) => id)).size).toBe(
          situation.examples.length,
        );
        for (const example of situation.examples) {
          expect(example.english).toMatch(/[.?]$/);
          english.push(example.english);
        }
      }
      expect(lesson.contrast.first).not.toBe(lesson.contrast.second);
    }
    expect(english).toHaveLength(48);
    expect(new Set(english).size).toBe(48);
  });
  it('supplies context, translations, explanations and contrast pairs in every content pack', () => {
    for (const [locale, pack] of Object.entries(usagePacks)) {
      expect(Object.keys(pack).sort()).toEqual(
        Object.keys(usageLessons).sort(),
      );
      for (const { id } of times) {
        const content = pack[id];
        expect(Object.keys(content.situations).sort()).toEqual(
          usageLessons[id].situations.map(({ id }) => id).sort(),
        );
        for (const situation of usageLessons[id].situations) {
          const text = content.situations[situation.id];
          expect(text.title.trim()).not.toBe('');
          expect(text.context.trim()).not.toBe('');
          expect(Object.keys(text.examples).sort()).toEqual(
            situation.examples.map(({ id }) => id).sort(),
          );
          for (const example of situation.examples) {
            expect(text.examples[example.id].translation.trim()).not.toBe('');
            expect(text.examples[example.id].explanation.trim()).not.toBe('');
          }
        }
        for (const value of Object.values(content.contrast))
          expect(value.trim()).not.toBe('');
        if (locale !== 'ru')
          expect(JSON.stringify(content)).not.toMatch(hasCyrillic);
      }
    }
    expect(usageContent('unsupported', 'presentSimple')).toEqual(
      usagePacks.ru.presentSimple,
    );
    expect(usagePacks.ru.futurePerfectContinuous.note).toBeTruthy();
  });
  it('keeps reference explanations complete and German translations available for all forms', () => {
    for (const [locale, pack] of Object.entries(referencePacks)) {
      expect(Object.keys(pack.tenseDescriptions).sort()).toEqual(
        times.map(({ id }) => id).sort(),
      );
      expect(Object.keys(pack.groupDescriptions).sort()).toEqual(
        Object.keys(referencePacks.ru.groupDescriptions).sort(),
      );
      expect(Object.keys(pack.learning).sort()).toEqual(
        Object.keys(referencePacks.ru.learning).sort(),
      );
      if (locale !== 'ru')
        expect(JSON.stringify(pack)).not.toMatch(hasCyrillic);
    }
    for (const { id } of times)
      expect(
        Object.keys(referencePacks.de.tableTranslations[id]!).sort(),
      ).toEqual(['neg', 'pos', 'q']);
  });
});
