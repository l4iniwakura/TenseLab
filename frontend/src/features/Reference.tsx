import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { groups, times } from '../domain/catalog';
import { overviewExamples } from '../domain/overview';
import { example } from '../domain/sentences';
import {
  forms,
  formSigns,
  type Form,
  type GroupId,
  type TenseId,
} from '../domain/types';
import { useStores } from '../stores/context';
import { GroupSelect } from '../components/Controls';
import { Formula, FormulaKey } from '../components/Formula';
import { referenceContent } from '../locales/content/reference';
import { UsageExamples } from './UsageExamples';
import styles from './Reference.module.css';

export const Reference = observer(function Reference() {
  const root = useStores();
  const { t } = root.i18n;
  const referenceLocale = root.i18n.uiLocale;
  const { learning, groupDescriptions, tenseDescriptions, tableTranslations } =
    referenceContent(referenceLocale);
  const drill = root.drill;
  const [exampleTense, setExampleTense] = useState<TenseId | null>(null);
  const exampleTrigger = useRef<HTMLButtonElement | null>(null);
  const closeExamples = () => {
    setExampleTense(null);
    exampleTrigger.current?.focus();
  };
  const [form, setForm] = useState<Form>('pos');
  const [group, setGroup] = useState<GroupId>('simple');
  return (
    <section aria-labelledby="reference-title">
      <div className="section-heading">
        <div>
          <h1 id="reference-title">{t('reference.title')}</h1>
          <p>{t('reference.intro')}</p>
        </div>
      </div>
      <div className="panel">
        <div className={styles.heading}>
          <h2>{t('reference.map')}</h2>
          <div
            className={styles.switcher}
            role="group"
            aria-label={t('reference.form')}
          >
            {forms.map((f) => (
              <button
                className={form === f ? styles.active : ''}
                key={f}
                aria-pressed={form === f}
                onClick={() => setForm(f)}
              >
                {formSigns[f]} {t(`form.${f}`)}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.builder}>
          <div>
            <h3>{t('reference.builder')}</h3>
            <p id="drill-selection-help">{t('reference.help')}</p>
            <span role="status">
              {t('reference.selected', {
                count: drill.selectedTenses.length,
                forms: drill.selectedTenses.length * 3,
              })}
            </span>
          </div>
          <div className={styles.builderActions}>
            <button
              className="button"
              onClick={() => drill.selectTenses(times.map((t) => t.id))}
            >
              {t('reference.all')}
            </button>
            <button
              className="button"
              disabled={!drill.selectedTenses.length}
              onClick={() => drill.selectTenses([])}
            >
              {t('reference.clear')}
            </button>
            <button
              className="button primary"
              disabled={!drill.selectedTenses.length}
              onClick={() => {
                drill.startCustom();
                root.navigate('drill');
              }}
            >
              {t('reference.start')}
            </button>
          </div>
        </div>
        <FormulaKey />
        <div
          className={styles.scroll}
          role="region"
          aria-label={t('reference.region')}
          tabIndex={0}
        >
          <table className={styles.overview}>
            <thead>
              <tr>
                <th scope="col">{t('reference.axes')}</th>
                {['Simple', 'Continuous', 'Perfect', 'Perfect Continuous'].map(
                  (a) => (
                    <th scope="col" key={a}>
                      {a}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {(['present', 'past', 'future'] as const).map((time) => (
                <tr key={time}>
                  <th scope="row">{time[0].toUpperCase() + time.slice(1)}</th>
                  {(
                    [
                      'Simple',
                      'Continuous',
                      'Perfect',
                      'PerfectContinuous',
                    ] as const
                  ).map((aspect) => {
                    const id: TenseId = `${time}${aspect}`;
                    const tense = times.find((t) => t.id === id)!;
                    return (
                      <td key={id}>
                        <div className={styles.mapCell}>
                          <button
                            className={styles.tenseSelect}
                            onClick={() => drill.toggleTense(id)}
                            aria-label={tense.label}
                            aria-pressed={drill.selectedTenses.includes(id)}
                            aria-describedby="drill-selection-help"
                          >
                            <Formula tense={id} form={form} />
                            <strong lang="en">
                              {overviewExamples[id][forms.indexOf(form)]}
                            </strong>
                            <small lang={referenceLocale}>
                              {tenseDescriptions[id]}
                            </small>
                          </button>
                          <button
                            className={styles.usageTrigger}
                            aria-label={t('usage.trigger', {
                              tense: tense.label,
                            })}
                            aria-expanded={exampleTense === id}
                            aria-controls={
                              exampleTense === id ? 'tense-usage' : undefined
                            }
                            onClick={(event) => {
                              exampleTrigger.current = event.currentTarget;
                              setExampleTense(id);
                            }}
                          >
                            {t('usage.open')}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.caption} lang={referenceLocale}>
          {learning.mapCaption}
        </p>
        {exampleTense && (
          <UsageExamples
            key={exampleTense}
            tense={exampleTense}
            onClose={closeExamples}
          />
        )}
      </div>
      <div className="panel">
        <div className={styles.heading}>
          <div>
            <h2>{t(`group.${group}`)}</h2>
            <p lang={referenceLocale}>{groupDescriptions[group]}</p>
          </div>
          <GroupSelect value={group} onChange={setGroup} />
        </div>
        <div
          className={styles.scroll}
          role="region"
          aria-label={t('reference.matrix')}
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">{t('translation.tense')}</th>
                {forms.map((f) => (
                  <th scope="col" key={f}>
                    {t(`form.${f}`)} ({formSigns[f]})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups[group].ids.map((id) => (
                <tr key={id}>
                  <th scope="row">{times.find((t) => t.id === id)!.label}</th>
                  {forms.map((f) => {
                    const item = example(id, f);
                    return (
                      <td key={f}>
                        <Formula tense={id} form={f} />
                        <strong lang="en">{item.en}</strong>
                        {referenceLocale !== 'en' && (
                          <small lang={referenceLocale}>
                            {referenceLocale === 'ru'
                              ? item.ru
                              : tableTranslations[id]?.[f]}
                          </small>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note" lang={referenceLocale}>
          {group === 'simple'
            ? learning.simpleNote
            : group === 'presentPerfect'
              ? learning.perfectNote
              : learning.otherNote}
        </p>
        <button
          className="button"
          onClick={() => {
            root.translation.setGroup(group);
            root.navigate('translation');
          }}
        >
          {t('reference.train')}
        </button>
      </div>
    </section>
  );
});
