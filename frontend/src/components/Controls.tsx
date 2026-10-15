import { cloneElement, useId, type ReactElement } from 'react';
import { groups } from '../domain/catalog';
import type { GroupId } from '../domain/types';
import styles from './Controls.module.css';

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}
export function GroupSelect({
  value,
  onChange,
  custom = false,
}: {
  value: GroupId;
  onChange: (group: GroupId) => void;
  custom?: boolean;
}) {
  return (
    <Field label="Таблица">
      <select
        value={custom ? 'custom' : value}
        onChange={(e) => onChange(e.target.value as GroupId)}
      >
        {custom && <option value="custom">Свой набор времён</option>}
        {(Object.keys(groups) as GroupId[]).map((id) => (
          <option key={id} value={id}>
            {id === 'simple'
              ? 'Simple · таблица Петрова'
              : id === 'all'
                ? 'Все 12 времён'
                : id === 'presentPerfect'
                  ? 'Present Perfect отдельно'
                  : groups[id].name.replace('Таблица · ', '')}
          </option>
        ))}
      </select>
    </Field>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Icon({
  name,
}: {
  name:
    | 'drill'
    | 'translation'
    | 'reference'
    | 'progress'
    | 'sun'
    | 'moon'
    | 'sound'
    | 'arrow';
}) {
  const paths = {
    drill: 'm13 2-9 12h7l-1 8 10-12h-7l1-8Z',
    translation:
      'M4 5h12M10 3v2M6 5c0 5 4 8 8 10M14 5c0 5-4 8-10 10M14 21l4-10 4 10M15.5 18h5',
    reference:
      'M3 4h7a2 2 0 0 1 2 2v15a3 3 0 0 0-3-2H3V4Zm18 0h-7a2 2 0 0 0-2 2v15a3 3 0 0 1 3-2h6V4Z',
    progress: 'M4 20V10M12 20V4M20 20v-7',
    sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    moon: 'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z',
    sound: 'M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
  };
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
