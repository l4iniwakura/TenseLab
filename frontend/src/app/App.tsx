import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { registerSW } from 'virtual:pwa-register';
import { RootStore, sectionFromHash } from '../stores/RootStore';
import { StoreContext } from '../stores/context';
import { Drill } from '../features/Drill';
import { Translation } from '../features/Translation';
import { Reference } from '../features/Reference';
import { Progress } from '../features/Progress';
import { Icon } from '../components/Controls';
import type { Section } from '../domain/types';
import { uiLocales, type UiLocale } from '../stores/I18nStore';
import { Field } from '../components/Controls';
import styles from './App.module.css';

const sections: Section[] = ['drill', 'translation', 'reference', 'progress'];

const Shell = observer(function Shell({ root }: { root: RootStore }) {
  const { t } = root.i18n;
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const updateApp = useRef<((reload?: boolean) => Promise<void>) | undefined>(
    undefined,
  );
  const heading = useRef<HTMLElement>(null);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    document.documentElement.lang = root.i18n.uiLocale;
  }, [root.i18n.uiLocale]);
  useEffect(() => {
    document.documentElement.dataset.theme = root.theme;
  }, [root.theme]);
  useEffect(() => {
    updateApp.current = registerSW({
      onOfflineReady: () => setOfflineReady(true),
      onNeedRefresh: () => setUpdateReady(true),
    });
    const hashChanged = () => {
      root.setSection(sectionFromHash(window.location.hash));
      heading.current?.focus();
    };
    const visibility = () => {
      root.progress.refreshDay();
      if (document.hidden) root.drill.stop();
    };
    const connection = () => setOnline(navigator.onLine);
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            'input,select,button,textarea,a,[contenteditable="true"]',
          ))
      )
        return;
      if (root.section === 'drill' && event.code === 'Space') {
        event.preventDefault();
        root.drill.toggleAnswer();
      }
      if (root.section === 'drill' && event.key === 'ArrowRight') {
        event.preventDefault();
        root.drill.next();
      }
      if (root.section === 'translation' && event.key === 'Enter') {
        event.preventDefault();
        if (root.translation.revealed) root.translation.mark(true);
        else root.translation.reveal();
      }
    };
    const timer = setInterval(root.progress.refreshDay, 30_000);
    window.addEventListener('hashchange', hashChanged);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('keydown', key);
    return () => {
      clearInterval(timer);
      root.drill.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      window.removeEventListener('hashchange', hashChanged);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('keydown', key);
    };
  }, [root]);
  return (
    <div className={styles.wrap}>
      <a
        className={styles.skip}
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          heading.current?.focus();
        }}
      >
        {t('shell.skip')}
      </a>
      <header className={styles.header}>
        <a className={styles.brand} href="#drill" aria-label={t('shell.brand')}>
          <span className={styles.logo}>T</span>TenseLab
        </a>
        <span className={styles.local}>
          {!online
            ? t('shell.offline')
            : offlineReady
              ? t('shell.ready')
              : t('shell.pace')}
        </span>
        <div className={styles.language}>
          <Field label={t('shell.language')}>
            <select
              value={root.i18n.uiLocale}
              onChange={(e) => root.i18n.setLocale(e.target.value as UiLocale)}
            >
              {uiLocales.map(({ id, name }) => (
                <option key={id} value={id} lang={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          className="button"
          aria-label={t('shell.theme')}
          onClick={root.toggleTheme}
        >
          <Icon name={root.theme === 'dark' ? 'sun' : 'moon'} />
          <span>
            {root.theme === 'dark' ? t('shell.light') : t('shell.dark')}
          </span>
        </button>
      </header>
      <nav className={styles.navigation} aria-label={t('shell.navigation')}>
        {sections.map((section) => (
          <a
            href={`#${section}`}
            key={section}
            aria-current={root.section === section ? 'page' : undefined}
          >
            <Icon name={section} />
            {t(`nav.${section}`)}
          </a>
        ))}
      </nav>
      {updateReady && (
        <div className="note" role="status">
          {t('shell.update')}{' '}
          <button
            className="button"
            onClick={() => void updateApp.current?.(true)}
          >
            {t('shell.reload')}
          </button>
        </div>
      )}
      {!root.progress.storageAvailable && (
        <p className="note" role="status">
          {t('shell.storage')}
        </p>
      )}
      {root.message && (
        <p className="note" role="status">
          {root.message}
        </p>
      )}
      <p className={styles.contentNotice}>{t('shell.content')}</p>
      <main
        id="main-content"
        ref={heading}
        tabIndex={-1}
        className={styles.main}
      >
        {root.section === 'drill' && <Drill />}
        {root.section === 'translation' && <Translation />}
        {root.section === 'reference' && <Reference />}
        {root.section === 'progress' && <Progress />}
      </main>
      <footer className={styles.footer}>
        <span>{t('shell.motto')}</span>
        <span>{t('shell.device')}</span>
      </footer>
    </div>
  );
});

export function App() {
  const [root] = useState(() => new RootStore());
  return (
    <StoreContext.Provider value={root}>
      <Shell root={root} />
    </StoreContext.Provider>
  );
}
