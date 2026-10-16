import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import { ProgressBar } from '../components/Controls';
import styles from './Progress.module.css';

export const Progress = observer(function Progress() {
  const root = useStores();
  const { t, number } = root.i18n;
  const progress = root.progress;
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <section aria-labelledby="progress-title">
      <div className="section-heading">
        <div>
          <h1 id="progress-title">{t('progress.title')}</h1>
          <p>{t('progress.intro')}</p>
        </div>
      </div>
      <div className="panel">
        <div className={styles.goal}>
          <h2>{t('progress.goal')}</h2>
          <span>{t('count.goal', { count: progress.todayCount })}</span>
        </div>
        <ProgressBar value={progress.percentage} label={t('progress.daily')} />
        <p className={styles.support}>
          {progress.todayCount >= 20
            ? t('progress.reached')
            : t('progress.practice')}
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>{t('progress.total')}</dt>
            <dd>{number(progress.stats.done)}</dd>
          </div>
          <div>
            <dt>{t('progress.accuracy')}</dt>
            <dd>{number(progress.accuracy / 100, { style: 'percent' })}</dd>
          </div>
          <div>
            <dt>{t('progress.streak')}</dt>
            <dd>{number(progress.stats.streak)}</dd>
          </div>
        </dl>
        {progress.stats.done === 0 && (
          <p className="note">{t('progress.empty')}</p>
        )}
        <button
          className="button primary"
          onClick={() => root.navigate('translation')}
        >
          {t('progress.continue')}
        </button>
      </div>
      <div className="panel">
        <h2>{t('progress.meaning')}</h2>
        <p className={styles.support}>{t('progress.explain')}</p>
        <p className={styles.support}>{t('progress.local')}</p>
        {!confirmReset ? (
          <button className="button" onClick={() => setConfirmReset(true)}>
            {t('progress.reset')}
          </button>
        ) : (
          <div
            className={styles.reset}
            role="group"
            aria-label={t('progress.confirmLabel')}
          >
            <p>{t('progress.confirm')}</p>
            <button
              className="button bad"
              onClick={() => {
                progress.reset();
                setConfirmReset(false);
              }}
            >
              {t('progress.yes')}
            </button>
            <button className="button" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
