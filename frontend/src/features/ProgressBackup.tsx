import { useState, type ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import type { UiKey } from '../stores/I18nStore';
import type { ProgressData } from '../storage/progress';
import { CHANNEL } from '../storage/progress';
import styles from './Progress.module.css';

function download(text: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ProgressBackup = observer(function ProgressBackup() {
  const { progress, i18n } = useStores();
  const { t, number } = i18n;
  const [pending, setPending] = useState<ProgressData | null>(null);
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState<UiKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState<string[]>([]);
  const [copy, setCopy] = useState('');
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setMessage(null);
    setPending(null);
    setReset(false);
    setLoading(true);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('large');
      setPending(progress.previewImport(await file.text()));
    } catch {
      setMessage('progress.importError');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="panel">
      <h2>{t('progress.safety')}</h2>
      <p className={styles.support}>{t('progress.local')}</p>
      <p className={styles.support}>
        {t('progress.environment', { channel: CHANNEL })}
      </p>
      <div className={styles.actions}>
        <button
          className="button"
          onClick={() => {
            download(
              progress.exportBackup(),
              `tenselab-${CHANNEL}-${progress.day}.json`,
            );
            setMessage('progress.exported');
          }}
        >
          {t('progress.export')}
        </button>
        <label className={styles.fileInput}>
          {t('progress.import')}
          <input
            type="file"
            accept=".json,application/json"
            disabled={loading}
            onChange={(event) => void importFile(event)}
          />
        </label>
        <button
          className="button"
          disabled={progress.data.legacyRecovered || loading}
          onClick={() => {
            setReset(false);
            setMessage(null);
            setPending(null);
            try {
              setPending(progress.legacyBackup());
            } catch {
              setMessage('progress.legacyError');
            }
          }}
        >
          {t('progress.restoreLegacy')}
        </button>
        {progress.problem && (
          <button
            className="button"
            onClick={() => {
              try {
                download(
                  progress.exportOriginal(),
                  `tenselab-original-${CHANNEL}.json`,
                );
                setMessage('progress.exported');
              } catch {
                setMessage('progress.originalError');
              }
            }}
          >
            {t('progress.exportOriginal')}
          </button>
        )}
        <button
          className="button"
          onClick={() => {
            try {
              const available = progress.localBackups();
              setCopies(available);
              setCopy(available[0] ?? '');
              setMessage(available.length ? null : 'progress.noCopies');
            } catch {
              setMessage('progress.originalError');
            }
          }}
        >
          {t('progress.localCopies')}
        </button>
      </div>
      <p className={styles.support}>{t('progress.importHelp')}</p>
      {copies.length > 0 && (
        <div className={styles.actions}>
          <label className={styles.field}>
            {t('progress.localCopies')}
            <select
              value={copy}
              onChange={(event) => setCopy(event.target.value)}
            >
              {copies.map((key) => (
                <option key={key} value={key}>
                  {key.split(':backup:')[1].slice(0, 24)} ·{' '}
                  {key.includes(':v1:') ? 'v1' : 'v2'} · {key.slice(-8)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button"
            onClick={() => {
              try {
                setPending(progress.previewLocalBackup(copy));
                setReset(false);
                setMessage(null);
              } catch {
                setMessage('progress.importError');
              }
            }}
          >
            {t('progress.reviewCopy')}
          </button>
          <button
            className="button"
            onClick={() => {
              try {
                download(
                  progress.readLocalBackup(copy),
                  `tenselab-local-${CHANNEL}.json`,
                );
              } catch {
                setMessage('progress.originalError');
              }
            }}
          >
            {t('progress.exportOriginal')}
          </button>
        </div>
      )}
      {loading && <p role="status">{t('progress.loading')}</p>}
      {message && (
        <p className="note" role="status">
          {t(message)}
        </p>
      )}
      {pending && (
        <div
          className={styles.confirmation}
          role="group"
          aria-label={t('progress.importConfirm')}
        >
          <h3>{t('progress.importConfirm')}</h3>
          <p>
            {t('progress.importPreview', {
              done: number(pending.totals.done),
              drills: number(pending.totals.drills),
              current: number(progress.stats.done),
              currentDrills: number(progress.stats.drills),
            })}
          </p>
          <p>{t('progress.replaceWarning')}</p>
          <div className={styles.actions}>
            <button
              className="button primary"
              onClick={() => {
                if (progress.replace(pending)) {
                  setPending(null);
                  setMessage('progress.imported');
                } else setMessage('progress.saveError');
              }}
            >
              {t('progress.replace')}
            </button>
            <button className="button" onClick={() => setPending(null)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
      <div className={styles.reset}>
        {!reset ? (
          <button
            className="button"
            onClick={() => {
              setReset(true);
              setPending(null);
            }}
          >
            {t('progress.reset')}
          </button>
        ) : (
          <div role="group" aria-label={t('progress.confirmLabel')}>
            <p>{t('progress.confirm')}</p>
            <div className={styles.actions}>
              <button
                className="button bad"
                onClick={() => {
                  if (progress.reset()) {
                    setReset(false);
                    setMessage('progress.resetDone');
                  } else setMessage('progress.saveError');
                }}
              >
                {t('progress.yes')}
              </button>
              <button className="button" onClick={() => setReset(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
