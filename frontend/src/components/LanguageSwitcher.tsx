import { observer } from 'mobx-react-lite';
import type { ReactNode } from 'react';
import { uiLocales, type UiLocale } from '../stores/I18nStore';
import { useStores } from '../stores/context';
import styles from './LanguageSwitcher.module.css';

const flags: Record<UiLocale, ReactNode> = {
  ru: (
    <>
      <path fill="#fff" d="M0 0h24v6H0z" />
      <path fill="#224fbd" d="M0 6h24v6H0z" />
      <path fill="#d52b32" d="M0 12h24v6H0z" />
    </>
  ),
  en: (
    <>
      <path fill="#17316b" d="M0 0h24v18H0z" />
      <path stroke="#fff" strokeWidth="4" d="m0 0 24 18M24 0 0 18" />
      <path stroke="#c92738" strokeWidth="1.5" d="m0 0 24 18M24 0 0 18" />
      <path stroke="#fff" strokeWidth="6" d="M12 0v18M0 9h24" />
      <path stroke="#c92738" strokeWidth="3.5" d="M12 0v18M0 9h24" />
    </>
  ),
  de: (
    <>
      <path fill="#181818" d="M0 0h24v6H0z" />
      <path fill="#d52b32" d="M0 6h24v6H0z" />
      <path fill="#f5c542" d="M0 12h24v6H0z" />
    </>
  ),
};

export const LanguageSwitcher = observer(function LanguageSwitcher() {
  const i18n = useStores().i18n;
  return (
    <div
      className={styles.languages}
      role="group"
      aria-label={i18n.t('shell.language')}
    >
      {uiLocales.map(({ id, name }) => (
        <button
          type="button"
          key={id}
          aria-label={name}
          title={name}
          aria-pressed={i18n.uiLocale === id}
          onClick={() => i18n.setLocale(id)}
        >
          <svg aria-hidden="true" width="24" height="18" viewBox="0 0 24 18">
            {flags[id]}
          </svg>
        </button>
      ))}
    </div>
  );
});
