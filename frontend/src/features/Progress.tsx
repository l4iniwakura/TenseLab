import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/context';
import { ProgressBar } from '../components/Controls';
import styles from './Progress.module.css';

export const Progress = observer(function Progress() {
  const root = useStores();
  const progress = root.progress;
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <section aria-labelledby="progress-title">
      <div className="section-heading">
        <div>
          <h1 id="progress-title">Маленькие шаги. Каждый день.</h1>
          <p>Твои результаты перевода сохраняются в этом браузере.</p>
        </div>
      </div>
      <div className="panel">
        <div className={styles.goal}>
          <h2>Цель на сегодня</h2>
          <span>{progress.todayCount} / 20 предложений</span>
        </div>
        <ProgressBar value={progress.percentage} label="Ежедневная цель" />
        <p className={styles.support}>
          {progress.todayCount >= 20
            ? 'Цель достигнута. Можно закончить на сегодня или продолжить в своём темпе.'
            : 'Немного практики каждый день. Точность важнее скорости.'}
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>Решено всего</dt>
            <dd>{progress.stats.done}</dd>
          </div>
          <div>
            <dt>Доля «получилось»</dt>
            <dd>{progress.accuracy}%</dd>
          </div>
          <div>
            <dt>Подряд правильно</dt>
            <dd>{progress.stats.streak}</dd>
          </div>
        </dl>
        {progress.stats.done === 0 && (
          <p className="note">
            Начни с одной карточки перевода: открой ответ и оцени себя — здесь
            появится первый результат.
          </p>
        )}
        <button
          className="button primary"
          onClick={() => root.navigate('translation')}
        >
          Продолжить перевод
        </button>
      </div>
      <div className="panel">
        <h2>Что означают эти числа</h2>
        <p className={styles.support}>
          Это самооценка в тренажёре перевода, а не измерение уровня
          английского. Устный дрилл помогает практиковаться, но не оценивает
          произношение и не увеличивает эти счётчики.
        </p>
        <p className={styles.support}>
          Прогресс и тема остаются на устройстве. Синхронизации между браузерами
          пока нет.
        </p>
        {!confirmReset ? (
          <button className="button" onClick={() => setConfirmReset(true)}>
            Сбросить статистику
          </button>
        ) : (
          <div
            className={styles.reset}
            role="group"
            aria-label="Подтверждение сброса"
          >
            <p>
              Сбросить все результаты перевода? Это действие нельзя отменить.
            </p>
            <button
              className="button bad"
              onClick={() => {
                progress.reset();
                setConfirmReset(false);
              }}
            >
              Да, сбросить
            </button>
            <button className="button" onClick={() => setConfirmReset(false)}>
              Отмена
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
