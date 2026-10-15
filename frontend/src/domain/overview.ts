import type { TenseId } from './types';
export const overviewExamples: Record<TenseId, [string, string, string]> = {
  presentSimple: ['I work.', 'I do not work.', 'Do I work?'],
  presentContinuous: ['I am working.', 'I am not working.', 'Am I working?'],
  presentPerfect: ['I have worked.', 'I have not worked.', 'Have I worked?'],
  presentPerfectContinuous: [
    'I have been working.',
    'I have not been working.',
    'Have I been working?',
  ],
  pastSimple: ['I worked.', 'I did not work.', 'Did I work?'],
  pastContinuous: ['I was working.', 'I was not working.', 'Was I working?'],
  pastPerfect: ['I had worked.', 'I had not worked.', 'Had I worked?'],
  pastPerfectContinuous: [
    'I had been working.',
    'I had not been working.',
    'Had I been working?',
  ],
  futureSimple: ['I will work.', 'I will not work.', 'Will I work?'],
  futureContinuous: [
    'I will be working.',
    'I will not be working.',
    'Will I be working?',
  ],
  futurePerfect: [
    'I will have worked.',
    'I will not have worked.',
    'Will I have worked?',
  ],
  futurePerfectContinuous: [
    'I will have been working.',
    'I will not have been working.',
    'Will I have been working?',
  ],
};
