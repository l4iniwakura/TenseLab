const contractions: Record<string, string> = {
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "can't": 'cannot',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "i'm": 'i am',
  "he's": 'he is',
  "she's": 'she is',
  "they're": 'they are',
  "we're": 'we are',
};

export function normalize(answer: string): string {
  return answer
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\b[\w]+('[\w]+)\b/g, (word) => contractions[word] ?? word)
    .replace(/[.,?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
