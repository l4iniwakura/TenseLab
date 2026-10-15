import { observer } from 'mobx-react-lite';
import { groups, people, times } from '../domain/catalog';
import {
  forms,
  formNames,
  type Form,
  type PersonId,
  type TenseId,
} from '../domain/types';
import { useStores } from '../stores/context';
import { Field, GroupSelect, Icon } from '../components/Controls';
import styles from './Practice.module.css';

export const Translation = observer(function Translation() {
  const root = useStores();
  const trainer = root.translation;
  const tense = times.find((t) => t.id === trainer.current.tense)!;
  return (
    <section aria-labelledby="translation-title">
      <div className="section-heading">
        <div>
          <h1 id="translation-title">Сначала мысль. Потом форма.</h1>
          <p>
            Переводи вслух или напиши свой вариант. Эталон поможет проверить
            конструкцию.
          </p>
        </div>
        <span className="tag">
          {trainer.pool.length.toLocaleString('ru-RU')} комбинаций
        </span>
      </div>
      <div className="panel">
        <div className={`${styles.controls} ${styles.fourControls}`}>
          <GroupSelect value={trainer.group} onChange={trainer.setGroup} />
          <Field label="Время">
            <select
              value={trainer.tense}
              onChange={(e) =>
                trainer.setTense(e.target.value as TenseId | 'all')
              }
            >
              <option value="all">Случайное из раздела</option>
              {groups[trainer.group].ids.map((id) => (
                <option key={id} value={id}>
                  {times.find((t) => t.id === id)!.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Тип предложения">
            <select
              value={trainer.form}
              onChange={(e) => trainer.setForm(e.target.value as Form | 'all')}
            >
              <option value="all">Любой: + / − / ?</option>
              {forms.map((f) => (
                <option key={f} value={f}>
                  {formNames[f]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Местоимение">
            <select
              value={trainer.person}
              onChange={(e) =>
                trainer.setPerson(
                  e.target.value === 'all'
                    ? 'all'
                    : (Number(e.target.value) as PersonId),
                )
              }
            >
              <option value="all">Любое местоимение</option>
              {people.map((p, i) => (
                <option key={p.en} value={i}>
                  {p.en}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className={styles.translationStage}>
          <div className={styles.taskMeta}>
            <span>
              {tense.label} · {formNames[trainer.current.form]}
            </span>
            <span>Карточка {trainer.cardNumber}</span>
          </div>
          <p className={styles.russian} aria-live="polite">
            {trainer.current.ru}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trainer.reveal();
            }}
          >
            <Field label="Твой вариант — можно просто произнести вслух">
              <input
                autoComplete="off"
                autoCapitalize="sentences"
                spellCheck={false}
                lang="en"
                value={trainer.input}
                onChange={(e) => trainer.setInput(e.target.value)}
                placeholder="Your answer…"
              />
            </Field>
            {!trainer.revealed && (
              <div className={styles.actionRow}>
                <button className="button primary" type="submit">
                  Показать ответ<kbd>Enter</kbd>
                </button>
                <button className="button" type="button" onClick={trainer.next}>
                  Пропустить
                  <Icon name="arrow" />
                </button>
              </div>
            )}
          </form>
          {trainer.revealed && (
            <div className={styles.reveal} aria-live="polite">
              <p className={styles.answer} lang="en">
                {trainer.current.en}
              </p>
              <p>{tense.exp}</p>
              <p className={styles.comparison}>{trainer.comparison}</p>
              <div className={styles.actionRow}>
                <button
                  className="button good"
                  onClick={() => trainer.mark(true)}
                >
                  Получилось
                </button>
                <button
                  className="button bad"
                  onClick={() => trainer.mark(false)}
                >
                  Нужно повторить
                </button>
                <button
                  className="button"
                  onClick={() => root.speak(trainer.current.en)}
                >
                  <Icon name="sound" />
                  Озвучить ответ
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.sessionFoot}>
          <span>На повторение в этой сессии: {trainer.queue.length}</span>
          <span>Самооценка · альтернативные переводы возможны</span>
        </div>
      </div>
      <p className="note">
        Русские подсказки содержат маркеры времени. В живой речи выбор
        конструкции зависит от контекста; совпадение с эталоном не заменяет
        оценку преподавателя.
      </p>
    </section>
  );
});
