import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { registerSW } from 'virtual:pwa-register';
import { RootStore, sectionFromHash } from '../stores/RootStore';
import { StoreContext } from '../stores/context';
import { Drill } from '../features/Drill';
import { Translation } from '../features/Translation';
import { Reference } from '../features/Reference';
import { Progress } from '../features/Progress';
import { Icon, ProgressBar } from '../components/Controls';
import { verbs } from '../domain/catalog';
import type { Section } from '../domain/types';
import styles from './App.module.css';

const sections: { id: Section; name: string }[] = [
  { id: 'drill', name: 'Быстрый дрилл' },
  { id: 'translation', name: 'Перевод' },
  { id: 'reference', name: 'Карта времён' },
  { id: 'progress', name: 'Мой прогресс' },
];

const Shell = observer(function Shell({ root }: { root: RootStore }) {
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const updateApp = useRef<((reload?: boolean) => Promise<void>) | undefined>(
    undefined,
  );
  const heading = useRef<HTMLElement>(null);
  const [online, setOnline] = useState(navigator.onLine);
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
        Перейти к упражнению
      </a>
      <header className={styles.header}>
        <a
          className={styles.brand}
          href="#drill"
          aria-label="TenseLab — быстрый дрилл"
        >
          <span className={styles.logo}>T</span>TenseLab
        </a>
        <span className={styles.local}>
          {!online
            ? 'Нет сети · локальная практика'
            : offlineReady
              ? 'Доступно без интернета'
              : 'Практика в своём темпе'}
        </span>
        <button
          className="button"
          aria-label="Переключить цветовую тему"
          onClick={root.toggleTheme}
        >
          <Icon name={root.theme === 'dark' ? 'sun' : 'moon'} />
          <span>{root.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>
      </header>
      <nav className={styles.navigation} aria-label="Разделы TenseLab">
        {sections.map((section) => (
          <a
            href={`#${section.id}`}
            key={section.id}
            aria-current={root.section === section.id ? 'page' : undefined}
          >
            <Icon name={section.id} />
            {section.name}
          </a>
        ))}
      </nav>
      <div className={styles.daily}>
        <span>
          <strong>Сегодня</strong> {root.progress.todayCount} / 20 предложений
        </span>
        <div>
          <ProgressBar
            value={root.progress.percentage}
            label="Прогресс на сегодня"
          />
        </div>
        <span className={styles.bank}>
          {(12 * 3 * 6 * verbs.length).toLocaleString('ru-RU')} комбинаций · 12
          времён
        </span>
      </div>
      {updateReady && (
        <div className="note" role="status">
          Доступна новая версия.{' '}
          <button
            className="button"
            onClick={() => void updateApp.current?.(true)}
          >
            Обновить приложение
          </button>
        </div>
      )}
      {!root.progress.storageAvailable && (
        <p className="note" role="status">
          Браузер не разрешил сохранить прогресс. В этой сессии результаты
          доступны, но после перезагрузки могут исчезнуть.
        </p>
      )}
      {root.message && (
        <p className="note" role="status">
          {root.message}
        </p>
      )}
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
        <span>TenseLab · От знания правил — к автоматизму</span>
        <span>Прогресс хранится на устройстве</span>
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
