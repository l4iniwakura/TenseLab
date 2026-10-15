import { observer } from 'mobx-react-lite';
import { times } from '../domain/catalog';
import { formNames, formSigns } from '../domain/types';
import { useStores } from '../stores/context';
import { Field, GroupSelect, Icon, ProgressBar } from '../components/Controls';
import styles from './Practice.module.css';

export const Drill = observer(function Drill() {
  const root = useStores();
  const drill = root.drill;
  const tense = times.find((t) => t.id === drill.current.tense)!;
  return (
    <section aria-labelledby="drill-title">
      <div className="section-heading">
        <div>
          <h1 id="drill-title">От правила — к автоматизму.</h1>
          <p>
            Одна фраза. Девять превращений. Сначала скажи вслух, затем проверь.
          </p>
        </div>
        <span className="tag">Раунд {drill.round}</span>
      </div>
      <div className={styles.workspace}>
        <div className="panel">
          <div className={styles.controls}>
            <GroupSelect value={drill.group} onChange={drill.setGroup} />
            <Field label="Порядок">
              <select
                value={drill.order}
                onChange={(e) =>
                  drill.setOrder(e.target.value as 'ordered' | 'random')
                }
              >
                <option value="ordered">По таблице</option>
                <option value="random">Случайный</option>
              </select>
            </Field>
            <Field label="Автотемп">
              <select
                value={drill.speed}
                onChange={(e) => drill.setSpeed(Number(e.target.value))}
              >
                {[0, 3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? 'Вручную / авто 5 сек.' : `${n} секунд`}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className={styles.stage}>
            <div className={styles.coordinates}>
              <span>{tense.label}</span>
              <span>{formNames[drill.current.form]}</span>
            </div>
            <p className={styles.source} lang="en">
              {drill.source}
            </p>
            <div
              className={styles.answerSlot}
              aria-live="polite"
              aria-atomic="true"
            >
              {drill.visible ? (
                <p className={styles.answer} lang="en">
                  {drill.answer}
                </p>
              ) : (
                <p className={styles.prompt}>Составь предложение вслух</p>
              )}
            </div>
            <button className="button primary" onClick={drill.toggleAnswer}>
              {drill.visible ? 'Скрыть ответ' : 'Показать ответ'}
              <kbd>Пробел</kbd>
            </button>
          </div>
          <div className={styles.actionRow}>
            <button className="button" onClick={() => root.speak(drill.answer)}>
              <Icon name="sound" />
              Озвучить
            </button>
            <button className="button" onClick={drill.next}>
              Следующая форма
              <Icon name="arrow" />
            </button>
          </div>
          <div className={styles.autoRow}>
            <button
              className={`button ${drill.running ? 'selected' : ''}`}
              onClick={drill.play}
            >
              {drill.running ? 'Пауза' : 'Автоматический дрилл'}
            </button>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={drill.autoReveal}
                onChange={(e) => drill.setAutoReveal(e.target.checked)}
              />
              Показывать ответ в автотемпе
            </label>
          </div>
        </div>
        <aside
          className={`panel ${styles.round}`}
          aria-label="Формы текущего раунда"
        >
          <div className={styles.roundHeading}>
            <h2>Твой круг</h2>
            <span>
              {drill.index + 1} / {drill.sequence.length}
            </span>
          </div>
          <ProgressBar
            value={drill.percentage}
            label="Пройденные формы раунда"
          />
          <div className={styles.grid}>
            {drill.sequence.map((cell, index) => (
              <button
                key={`${cell.tense}-${cell.form}`}
                className={`${styles.cell} ${index === drill.index ? styles.current : ''} ${index < drill.index ? styles.visited : ''}`}
                aria-label={`${times.find((t) => t.id === cell.tense)!.label}, ${formNames[cell.form]}`}
                aria-current={index === drill.index ? 'step' : undefined}
                onClick={() => drill.jump(index)}
              >
                <span>{formSigns[cell.form]}</span>
                {times
                  .find((t) => t.id === cell.tense)!
                  .label.replace('Perfect Continuous', 'Perf. Cont.')}
              </button>
            ))}
          </div>
          <button
            className={`button ${styles.fullWidth}`}
            onClick={drill.newRound}
          >
            Новая фраза
          </button>
          <p className={styles.help}>
            Пробел — ответ, стрелка вправо — следующая форма. Озвучка
            запускается только по нажатию.
          </p>
        </aside>
      </div>
      <details className="guide">
        <summary>Как заниматься за 10–15 минут</summary>
        <ol>
          <li>Проговори 9 форм по таблице — около 2 минут.</li>
          <li>
            Перейди в «Перевод» и потренируйся без подсказок — около 7 минут.
          </li>
          <li>Вернись к ошибкам и проверь себя — около 3 минут.</li>
          <li>
            Добавь короткий фрагмент живого диалога из своего источника: таблица
            не заменяет контекст.
          </li>
        </ol>
      </details>
    </section>
  );
});
