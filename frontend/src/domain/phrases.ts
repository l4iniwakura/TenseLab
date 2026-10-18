import { people, verbs } from './catalog';

// Legacy verbs retain their six human subjects. New content opts into reviewed pairs.
export const phrases = people.flatMap((person) =>
  verbs.flatMap((verb, verbIndex) =>
    (verb.subjects ? verb.subjects.includes(person.p) : person.p < 6)
      ? [{ person: person.p, verbIndex }]
      : [],
  ),
);
