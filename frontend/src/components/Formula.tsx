import { Fragment } from 'react';
import { formula } from '../domain/formulas';
import type { Form, PersonId, TenseId } from '../domain/types';
import styles from './Formula.module.css';

export function Formula({
  tense,
  form,
  person,
}: {
  tense: TenseId;
  form: Form;
  person?: PersonId;
}) {
  const parts = formula(tense, form, person);
  return (
    <span
      className={styles.formula}
      aria-label={`Формула: ${parts.join(' + ')}${form === 'q' ? ' ?' : ''}`}
    >
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className={styles.join} aria-hidden="true">
              +
            </span>
          )}
          <span
            lang="en"
            className={
              part === 'S'
                ? styles.subject
                : part.startsWith('V')
                  ? styles.verb
                  : part === 'not'
                    ? styles.negative
                    : styles.auxiliary
            }
          >
            {part}
          </span>
        </Fragment>
      ))}
      {form === 'q' && <span aria-hidden="true">?</span>}
    </span>
  );
}

export function FormulaKey() {
  return (
    <div className={styles.key} aria-label="Как читать формулы">
      <span>
        <b>S</b> — кто: I, you, he, she, we, they
      </span>
      <span>
        <b>V1</b> — write
      </span>
      <span>
        <b>V-s</b> — writes
      </span>
      <span>
        <b>V2</b> — wrote
      </span>
      <span>
        <b>V3</b> — written
      </span>
      <span>
        <b>V-ing</b> — writing
      </span>
      <p>
        Читай слева направо, затем добавь остальные слова. В Present Simple с he
        / she / it используй V-s (окончание -s / -es) или does; с остальными —
        V1 или do. В Present Perfect: he / she / it — has; остальные — have. Для
        Continuous: I — am; he / she / it — is; you / we / they — are. В
        прошлом: I / he / she / it — was; you / we / they — were.
      </p>
    </div>
  );
}
