import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import { ProgressBar } from '../components/Controls';
import { ActivityCalendar } from './ActivityCalendar';
import { ProgressBackup } from './ProgressBackup';
import { shiftDay } from '../storage/progress';
import styles from './Progress.module.css';

export const Progress = observer(function Progress() {
  const root = useStores();
  const { t, number, date } = root.i18n;
  const progress = root.progress;
  const entry = progress.selected;
  const day = progress.viewingDay;
  const label = (value: string) =>
    date(new Date(`${value}T12:00:00`), { dateStyle: 'long' });
  return (
    <section aria-labelledby="progress-title">
      <div className="section-heading">
        <div>
          <h1 id="progress-title">{t('progress.title')}</h1>
          <p>{t('progress.intro')}</p>
        </div>
      </div>
      {progress.problem && (
        <p className="note" role="alert">
          {t(`progress.problem.${progress.problem}`)}
        </p>
      )}
      <div className="panel" role="region" aria-labelledby="lifetime-title">
        <h2 id="lifetime-title">{t('progress.lifetime')}</h2>
        <dl className={styles.stats}>
          <div>
            <dt>{t('progress.drills')}</dt>
            <dd>{number(progress.stats.drills)}</dd>
          </div>
          <div>
            <dt>{t('progress.translations')}</dt>
            <dd>{number(progress.stats.done)}</dd>
          </div>
          <div>
            <dt>{t('progress.correct')}</dt>
            <dd>{number(progress.stats.right)}</dd>
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
        <p className={styles.support}>
          {t('progress.historySince', {
            date: label(progress.data.historySince),
          })}
        </p>
      </div>
      <ActivityCalendar />
      <div className="panel" aria-labelledby="day-title">
        <div className={styles.toolbar}>
          <h2 id="day-title">
            {day === progress.day ? t('progress.today') : label(day)}
          </h2>
          <div className={styles.dayControls}>
            <button
              className="button"
              aria-label={t('progress.previousDay')}
              onClick={() => progress.selectDay(shiftDay(day, -1))}
            >
              {t('progress.previousDay')}
            </button>
            <label className={styles.field}>
              {t('progress.chooseDay')}
              <input
                type="date"
                value={day}
                max={progress.day}
                onChange={(event) => progress.selectDay(event.target.value)}
              />
            </label>
            <button
              className="button"
              disabled={day >= progress.day}
              aria-label={t('progress.nextDay')}
              onClick={() => progress.selectDay(shiftDay(day, 1))}
            >
              {t('progress.nextDay')}
            </button>
            <button
              className="button"
              disabled={day === progress.day}
              onClick={progress.showToday}
            >
              {t('progress.today')}
            </button>
          </div>
        </div>
        <dl className={`${styles.stats} ${styles.dayStats}`}>
          <div>
            <dt>{t('progress.drills')}</dt>
            <dd>{number(entry.drills)}</dd>
          </div>
          <div>
            <dt>{t('progress.translations')}</dt>
            <dd>{number(entry.done)}</dd>
          </div>
          <div>
            <dt>{t('progress.correct')}</dt>
            <dd>
              {entry.unknown ? `${number(entry.right)}+` : number(entry.right)}
            </dd>
          </div>
          <div>
            <dt>{t('progress.accuracy')}</dt>
            <dd>
              {entry.unknown
                ? '—'
                : number(entry.done ? entry.right / entry.done : 0, {
                    style: 'percent',
                    maximumFractionDigits: 0,
                  })}
            </dd>
          </div>
        </dl>
        {!!entry.unknown && (
          <p className="note">
            {t('progress.partialDay', { count: entry.unknown })}
          </p>
        )}
        {!entry.done && !entry.drills && (
          <p className="note">
            {t(
              day < progress.data.historySince
                ? 'progress.noHistory'
                : 'progress.emptyDay',
            )}
          </p>
        )}
        {day === progress.day && (
          <>
            <div className={styles.goal}>
              <h3>{t('progress.goal')}</h3>
              <span>{t('count.goal', { count: progress.todayCount })}</span>
            </div>
            <ProgressBar
              value={progress.percentage}
              label={t('progress.daily')}
            />
            <p className={styles.support}>
              {t(
                progress.todayCount >= 20
                  ? 'progress.reached'
                  : 'progress.practice',
              )}
            </p>
          </>
        )}
        <div className={styles.actions}>
          <button
            className="button primary"
            onClick={() => root.navigate('drill')}
          >
            {t('progress.continueDrill')}
          </button>
          <button
            className="button"
            onClick={() => root.navigate('translation')}
          >
            {t('progress.continue')}
          </button>
        </div>
      </div>
      <div className="panel">
        <h2>{t('progress.meaning')}</h2>
        <p className={styles.support}>{t('progress.explain')}</p>
        <p className={styles.support}>{t('progress.timezone')}</p>
      </div>
      <ProgressBackup />
    </section>
  );
});
