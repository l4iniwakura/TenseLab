import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import { referenceContent } from '../locales/content/reference';
import { Fragment } from 'react';
import { formula } from '../domain/formulas';
import type { Form, PersonId, TenseId } from '../domain/types';
import styles from './Formula.module.css';

export const Formula = observer(function Formula({
  tense,
  form,
  person,
}: {
  tense: TenseId;
  form: Form;
  person?: PersonId;
}) {
  const { t } = useStores().i18n;
  const parts = formula(tense, form, person);
  return (
    <span
      className={styles.formula}
      aria-label={t('formula.label', {
        formula: `${parts.join(' + ')}${form === 'q' ? ' ?' : ''}`,
      })}
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
});

export const FormulaKey = observer(function FormulaKey() {
  const { t, uiLocale } = useStores().i18n;
  const { learning } = referenceContent(uiLocale);
  return (
    <div className={styles.key} aria-label={t('formula.guide')} lang={uiLocale}>
      <span>
        <b>S</b> {learning.subject}
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
      <p>{learning.formulas}</p>
    </div>
  );
});
