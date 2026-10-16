import { observer } from 'mobx-react-lite';
import { groups, people, times } from '../domain/catalog';
import { forms, type Form, type PersonId, type TenseId } from '../domain/types';
import { useStores } from '../stores/context';
import { Field, GroupSelect, Icon } from '../components/Controls';
import styles from './Practice.module.css';

export const Translation = observer(function Translation() {
  const root = useStores();
  const { t } = root.i18n;
  const trainer = root.translation;
  const tense = times.find((t) => t.id === trainer.current.tense)!;
  return (
    <section aria-labelledby="translation-title">
      <div className="section-heading">
        <div>
          <h1 id="translation-title">{t('translation.title')}</h1>
          <p>{t('translation.intro')}</p>
        </div>
        <span className="tag">
          {t('count.combinations', { count: trainer.pool.length })}
        </span>
      </div>
      <div className="panel">
        <div className={`${styles.controls} ${styles.fourControls}`}>
          <GroupSelect value={trainer.group} onChange={trainer.setGroup} />
          <Field label={t('translation.tense')}>
            <select
              value={trainer.tense}
              onChange={(e) =>
                trainer.setTense(e.target.value as TenseId | 'all')
              }
            >
              <option value="all">{t('translation.random')}</option>
              {groups[trainer.group].ids.map((id) => (
                <option key={id} value={id}>
                  {times.find((t) => t.id === id)!.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('translation.form')}>
            <select
              value={trainer.form}
              onChange={(e) => trainer.setForm(e.target.value as Form | 'all')}
            >
              <option value="all">{t('translation.anyForm')}</option>
              {forms.map((f) => (
                <option key={f} value={f}>
                  {t(`form.${f}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('translation.person')}>
            <select
              value={trainer.person}
              onChange={(e) =>
                trainer.setPerson(
                  e.target.value === 'all'
                    ? 'all'
                    : (Number(e.target.value) as PersonId),
                )
              }
            >
              <option value="all">{t('translation.anyPerson')}</option>
              {people.map((p, i) => (
                <option key={p.en} value={i}>
                  {p.en}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className={styles.translationStage}>
          <div className={styles.taskMeta}>
            <span>
              {tense.label} · {t(`form.${trainer.current.form}`)}
            </span>
            <span>{t('translation.card', { count: trainer.cardNumber })}</span>
          </div>
          <p
            className={styles.russian}
            lang={root.i18n.contentLocale}
            aria-live="polite"
          >
            {trainer.current.ru}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trainer.reveal();
            }}
          >
            <Field label={t('translation.input')}>
              <input
                autoComplete="off"
                autoCapitalize="sentences"
                spellCheck={false}
                lang="en"
                value={trainer.input}
                onChange={(e) => trainer.setInput(e.target.value)}
                placeholder={t('translation.placeholder')}
              />
            </Field>
            {!trainer.revealed && (
              <div className={styles.actionRow}>
                <button className="button primary" type="submit">
                  {t('answer.show')}
                  <kbd>Enter</kbd>
                </button>
                <button className="button" type="button" onClick={trainer.next}>
                  {t('translation.skip')}
                  <Icon name="arrow" />
                </button>
              </div>
            )}
          </form>
          {trainer.revealed && (
            <div className={styles.reveal} aria-live="polite">
              <p className={styles.answer} lang="en">
                {trainer.current.en}
              </p>
              <p lang={root.i18n.contentLocale}>{tense.exp}</p>
              <p className={styles.comparison}>
                {t(trainer.comparisonKey, { answer: trainer.input })}
              </p>
              <div className={styles.actionRow}>
                <button
                  className="button good"
                  onClick={() => trainer.mark(true)}
                >
                  {t('translation.correct')}
                </button>
                <button
                  className="button bad"
                  onClick={() => trainer.mark(false)}
                >
                  {t('translation.retry')}
                </button>
                <button
                  className="button"
                  onClick={() => root.speak(trainer.current.en)}
                >
                  <Icon name="sound" />
                  {t('translation.speak')}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.sessionFoot}>
          <span>{t('translation.queue', { count: trainer.queue.length })}</span>
          <span>{t('translation.self')}</span>
        </div>
      </div>
      <p className="note">{t('translation.note')}</p>
    </section>
  );
});
