import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { times } from '../domain/catalog';
import { usageLessons } from '../domain/usage';
import type { TenseId } from '../domain/types';
import { usageContent } from '../locales/content/usage';
import { Icon } from '../components/Controls';
import { useStores } from '../stores/context';
import styles from './Reference.module.css';

export const UsageExamples = observer(function UsageExamples({
  tense,
  onClose,
}: {
  tense: TenseId;
  onClose: () => void;
}) {
  const { t, uiLocale } = useStores().i18n;
  const [situationIndex, setSituationIndex] = useState(0);
  const region = useRef<HTMLElement>(null);
  const lesson = usageLessons[tense];
  const content = usageContent(uiLocale, tense);
  const situation = lesson.situations[situationIndex];
  const text = content.situations[situation.id];
  useEffect(() => {
    region.current?.focus();
  }, []);
  return (
    <section
      id="tense-usage"
      ref={region}
      tabIndex={-1}
      className={styles.usage}
      aria-labelledby="usage-title"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className={styles.heading}>
        <h3 id="usage-title">
          {t('usage.title', {
            tense: times.find((item) => item.id === tense)!.label,
          })}
        </h3>
        <button
          className="button"
          onClick={onClose}
          aria-label={t('usage.close')}
          title={t('usage.close')}
        >
          <Icon name="close" />
        </button>
      </div>
      <div
        className={styles.switcher}
        role="group"
        aria-label={t('usage.situations')}
      >
        {lesson.situations.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={situationIndex === index}
            aria-controls="usage-situation"
            className={situationIndex === index ? styles.active : ''}
            onClick={() => setSituationIndex(index)}
          >
            {content.situations[item.id].title}
          </button>
        ))}
      </div>
      <div
        id="usage-situation"
        lang={uiLocale}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className={styles.context}>{text.context}</p>
        <ol className={styles.usageList}>
          {situation.examples.map((item) => (
            <li key={item.id}>
              <p className={styles.english} lang="en">
                {item.english}
              </p>
              {uiLocale !== 'en' && (
                <p className={styles.translation}>
                  {text.examples[item.id].translation}
                </p>
              )}
              <p className={styles.explanation}>
                {text.examples[item.id].explanation}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <details className={styles.contrast}>
        <summary>{t('usage.compare')}</summary>
        <div lang={uiLocale}>
          <p className={styles.english} lang="en">
            {lesson.contrast.first}
          </p>
          {uiLocale !== 'en' && (
            <p className={styles.translation}>{content.contrast.first}</p>
          )}
          <p className={styles.english} lang="en">
            {lesson.contrast.second}
          </p>
          {uiLocale !== 'en' && (
            <p className={styles.translation}>{content.contrast.second}</p>
          )}
          <p className={styles.explanation}>{content.contrast.explanation}</p>
        </div>
      </details>
      {content.note && (
        <p className={styles.caption} lang={uiLocale}>
          {content.note}
        </p>
      )}
    </section>
  );
});
