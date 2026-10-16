import { useState, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import { localDay } from '../storage/local';
import { shiftDay } from '../storage/progress';
import styles from './Progress.module.css';

export const ActivityCalendar = observer(function ActivityCalendar() {
  const { progress, i18n } = useStores();
  const { t, date } = i18n;
  const [metric, setMetric] = useState<'drills' | 'done'>('drills');
  const [focused, setFocused] = useState(progress.day);
  const [month, setMonth] = useState(progress.day.slice(0, 7));
  const end = new Date(`${progress.day}T12:00:00`);
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1, 12);
  const startDay = localDay(start);
  const annual: string[] = [];
  for (let day = startDay; day <= progress.day; day = shiftDay(day, 1))
    annual.push(day);
  const offset = (start.getDay() + 6) % 7;
  const months = Array.from({ length: 12 }, (_, index) => {
    const value = new Date(
      start.getFullYear(),
      start.getMonth() + index,
      1,
      12,
    );
    return {
      key: localDay(value).slice(0, 7),
      label: date(value, { month: 'long', year: 'numeric' }),
    };
  });
  const visibleMonth = months.some((item) => item.key === month)
    ? month
    : months[11].key;
  const monthDays = annual.filter((day) => day.startsWith(visibleMonth));
  const description = (day: string) => {
    const entry = progress.forDay(day);
    return `${date(new Date(`${day}T12:00:00`), { dateStyle: 'long' })}: ${t('progress.cell', { drills: entry.drills, done: entry.done })}`;
  };
  const level = (day: string) => {
    const value = progress.forDay(day)[metric];
    return value === 0 ? 0 : value < 3 ? 1 : value < 6 ? 2 : value < 10 ? 3 : 4;
  };
  const navigate = (
    event: KeyboardEvent<HTMLButtonElement>,
    day: string,
    monthly: boolean,
  ) => {
    const offsets: Record<string, number> = monthly
      ? { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
      : { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    const delta = offsets[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = shiftDay(day, delta);
    if (next < startDay || next > progress.day) return;
    if (monthly && !next.startsWith(visibleMonth)) return;
    const target =
      event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
        `[data-day="${next}"]`,
      );
    target?.focus();
  };
  const cell = (day: string, monthly: boolean, index: number) => (
    <button
      key={day}
      type="button"
      data-day={day}
      data-level={level(day)}
      className={styles.calendarDay}
      style={
        monthly && index === 0
          ? {
              gridColumnStart:
                ((new Date(`${day}T12:00:00`).getDay() + 6) % 7) + 1,
            }
          : undefined
      }
      tabIndex={
        day ===
        (monthly
          ? focused.startsWith(visibleMonth)
            ? focused
            : monthDays[0]
          : focused)
          ? 0
          : -1
      }
      aria-label={description(day)}
      aria-pressed={progress.viewingDay === day}
      title={description(day)}
      onFocus={() => setFocused(day)}
      onMouseEnter={() => setFocused(day)}
      onKeyDown={(event) => navigate(event, day, monthly)}
      onClick={() => progress.selectDay(day)}
    >
      {monthly ? Number(day.slice(-2)) : null}
    </button>
  );
  return (
    <div className="panel">
      <div className={styles.toolbar}>
        <h2>{t('progress.activity')}</h2>
        <label className={styles.field}>
          {t('progress.metric')}
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as typeof metric)}
          >
            <option value="drills">{t('progress.drills')}</option>
            <option value="done">{t('progress.translations')}</option>
          </select>
        </label>
      </div>
      <p className={styles.support}>{t('progress.calendarHelp')}</p>
      <div className={styles.annual}>
        <div className={styles.range}>
          <span>{months[0].label}</span>
          <span>{months[11].label}</span>
        </div>
        <div
          className={styles.yearGrid}
          aria-label={t('progress.activity')}
          role="group"
        >
          {Array.from({ length: offset }, (_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {annual.map((day, index) => cell(day, false, index))}
        </div>
      </div>
      <div className={styles.monthly}>
        <label className={styles.field}>
          {t('progress.month')}
          <select
            value={visibleMonth}
            onChange={(event) => setMonth(event.target.value)}
          >
            {months.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div
          className={styles.monthGrid}
          role="group"
          aria-label={t('progress.activity')}
        >
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} className={styles.weekday} aria-hidden="true">
              {date(new Date(2026, 0, 5 + index, 12), { weekday: 'short' })}
            </span>
          ))}
          {monthDays.map((day, index) => cell(day, true, index))}
        </div>
      </div>
      <div className={styles.legend}>
        {[0, 1, 2, 3, 4].map((item) => (
          <span className={styles.legendItem} key={item}>
            <span
              className={styles.swatch}
              data-level={item}
              aria-hidden="true"
            />
            <span>{['0', '1–2', '3–5', '6–9', '10+'][item]}</span>
          </span>
        ))}
      </div>
      <p className={styles.calendarDetail} aria-live="polite">
        {description(focused)}
      </p>
    </div>
  );
});
