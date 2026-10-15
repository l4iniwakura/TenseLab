import { observer } from 'mobx-react-lite';
import { times } from '../domain/catalog';
import { formSigns } from '../domain/types';
import { useStores } from '../stores/context';
import { Field, GroupSelect, Icon, ProgressBar } from '../components/Controls';
import { Formula, FormulaKey } from '../components/Formula';
import { learning } from '../locales/content/ru/learning';
import styles from './Practice.module.css';

export const Drill = observer(function Drill() {
  const root = useStores();
  const { t } = root.i18n;
  const drill = root.drill;
  const tense = times.find((t) => t.id === drill.current.tense)!;
  return (
    <section aria-labelledby="drill-title">
      <div className="section-heading">
        <div>
          <h1 id="drill-title">{t('drill.title')}</h1>
          <p>{t('drill.intro', { count: drill.sequence.length })}</p>
        </div>
        <span className="tag">{t('drill.round', { count: drill.round })}</span>
      </div>
      <div className={styles.workspace}>
        <div className="panel">
          <div className={styles.controls}>
            <GroupSelect
              value={drill.group}
              onChange={drill.setGroup}
              custom={drill.customTenses !== null}
            />
            <Field label={t('drill.order')}>
              <select
                value={drill.order}
                onChange={(e) =>
                  drill.setOrder(e.target.value as 'ordered' | 'random')
                }
              >
                <option value="ordered">{t('drill.ordered')}</option>
                <option value="random">{t('drill.random')}</option>
              </select>
            </Field>
            <Field label={t('drill.tempo')}>
              <select
                value={drill.speed}
                onChange={(e) => drill.setSpeed(Number(e.target.value))}
              >
                {[0, 3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n === 0
                      ? t('drill.manual')
                      : t('count.seconds', { count: n })}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className={styles.help}>
            {drill.customTenses
              ? t('drill.custom', {
                  tenses: drill.customTenses
                    .map((id) => times.find((t) => t.id === id)!.label)
                    .join(', '),
                })
              : t('drill.chooseHint')}{' '}
            <a href="#reference">{t('drill.choose')}</a>
          </p>
          <div className={styles.stage}>
            <div className={styles.coordinates}>
              <span>{tense.label}</span>
              <span>{t(`form.${drill.current.form}`)}</span>
            </div>
            <p className={styles.source} lang="en">
              {drill.source}
            </p>
            <div
              className={styles.formulaHint}
              aria-live="polite"
              aria-atomic="true"
            >
              <Formula
                tense={drill.current.tense}
                form={drill.current.form}
                person={drill.person}
              />
              <p>{t('drill.subject')}</p>
            </div>
            <div
              className={styles.answerSlot}
              aria-live="polite"
              aria-atomic="true"
            >
              {drill.visible ? (
                <p className={styles.answer} lang="en">
                  {drill.answer}
                </p>
              ) : (
                <p className={styles.prompt}>{t('drill.prompt')}</p>
              )}
            </div>
            <button className="button primary" onClick={drill.toggleAnswer}>
              {drill.visible ? t('answer.hide') : t('answer.show')}
              <kbd>{t('key.space')}</kbd>
            </button>
          </div>
          <div className={styles.actionRow}>
            <button className="button" onClick={() => root.speak(drill.answer)}>
              <Icon name="sound" />
              {t('speech.play')}
            </button>
            <button className="button" onClick={drill.next}>
              {t('drill.next')}
              <Icon name="arrow" />
            </button>
          </div>
          <div className={styles.autoRow}>
            <button
              className={`button ${drill.running ? 'selected' : ''}`}
              onClick={drill.play}
            >
              {drill.running ? t('drill.pause') : t('drill.auto')}
            </button>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={drill.autoReveal}
                onChange={(e) => drill.setAutoReveal(e.target.checked)}
              />
              {t('drill.autoReveal')}
            </label>
          </div>
        </div>
        <aside
          className={`panel ${styles.round}`}
          aria-label={t('drill.forms')}
        >
          <div className={styles.roundHeading}>
            <h2>{t('drill.circle')}</h2>
            <span>
              {t('count.fraction', {
                count: drill.index + 1,
                total: drill.sequence.length,
              })}
            </span>
          </div>
          <ProgressBar value={drill.percentage} label={t('drill.completed')} />
          <div className={styles.grid}>
            {drill.sequence.map((cell, index) => (
              <button
                key={`${cell.tense}-${cell.form}`}
                className={`${styles.cell} ${index === drill.index ? styles.current : ''} ${index < drill.index ? styles.visited : ''}`}
                aria-label={t('drill.cell', {
                  tense: times.find((t) => t.id === cell.tense)!.label,
                  form: t(`form.${cell.form}`),
                })}
                aria-current={index === drill.index ? 'step' : undefined}
                onClick={() => drill.jump(index)}
              >
                <span>{formSigns[cell.form]}</span>
                {times
                  .find((t) => t.id === cell.tense)!
                  .label.replace('Perfect Continuous', 'Perf. Cont.')}
              </button>
            ))}
          </div>
          <button
            className={`button ${styles.fullWidth}`}
            onClick={drill.newRound}
          >
            {t('drill.new')}
          </button>
          <p className={styles.help}>{t('drill.shortcuts')}</p>
        </aside>
      </div>
      <details className="guide">
        <summary>{t('formula.guide')}</summary>
        <FormulaKey />
        <p lang={root.i18n.contentLocale}>{learning.simpleRules}</p>
      </details>
      <details className="guide">
        <summary>{t('drill.guide')}</summary>
        <ol>
          <li>{t('drill.step1')}</li>
          <li>{t('drill.step2')}</li>
          <li>{t('drill.step3')}</li>
          <li>{t('drill.step4')}</li>
        </ol>
      </details>
    </section>
  );
});
