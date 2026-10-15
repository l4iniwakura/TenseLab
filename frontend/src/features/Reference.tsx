import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { groups, times } from '../domain/catalog';
import { overviewExamples } from '../domain/overview';
import { example } from '../domain/sentences';
import {
  forms,
  formNames,
  formSigns,
  type Form,
  type GroupId,
  type TenseId,
} from '../domain/types';
import { useStores } from '../stores/context';
import { GroupSelect } from '../components/Controls';
import { Formula, FormulaKey } from '../components/Formula';
import styles from './Reference.module.css';

export const Reference = observer(function Reference() {
  const root = useStores();
  const drill = root.drill;
  const [form, setForm] = useState<Form>('pos');
  const [group, setGroup] = useState<GroupId>('simple');
  return (
    <section aria-labelledby="reference-title">
      <div className="section-heading">
        <div>
          <h1 id="reference-title">Вся система перед глазами.</h1>
          <p>
            Сравни одну мысль в разных конструкциях. Нажми на нужные ячейки,
            чтобы выбрать времена для своего дрилла.
          </p>
        </div>
      </div>
      <div className="panel">
        <div className={styles.heading}>
          <h2>Карта времён · 3 × 4</h2>
          <div
            className={styles.switcher}
            role="group"
            aria-label="Тип предложения в карте"
          >
            {forms.map((f) => (
              <button
                className={form === f ? styles.active : ''}
                key={f}
                aria-pressed={form === f}
                onClick={() => setForm(f)}
              >
                {formSigns[f]} {formNames[f]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.builder}>
          <div>
            <h3>Собери свой дрилл</h3>
            <p id="drill-selection-help">
              Нажми на ячейку, чтобы выбрать время, ещё раз — чтобы снять выбор.
              В дрилл войдут все три формы каждого времени.
            </p>
            <span role="status">
              Выбрано времён: {drill.selectedTenses.length} из 12 · форм в
              раунде: {drill.selectedTenses.length * 3}
            </span>
          </div>
          <div className={styles.builderActions}>
            <button
              className="button"
              onClick={() => drill.selectTenses(times.map((t) => t.id))}
            >
              Выбрать все
            </button>
            <button
              className="button"
              disabled={!drill.selectedTenses.length}
              onClick={() => drill.selectTenses([])}
            >
              Снять выбор
            </button>
            <button
              className="button primary"
              disabled={!drill.selectedTenses.length}
              onClick={() => {
                drill.startCustom();
                root.navigate('drill');
              }}
            >
              Начать дрилл
            </button>
          </div>
        </div>
        <FormulaKey />
        <div
          className={styles.scroll}
          role="region"
          aria-label="Карта двенадцати времён"
          tabIndex={0}
        >
          <table className={styles.overview}>
            <thead>
              <tr>
                <th scope="col">Время / Аспект</th>
                {['Simple', 'Continuous', 'Perfect', 'Perfect Continuous'].map(
                  (a) => (
                    <th scope="col" key={a}>
                      {a}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {(['present', 'past', 'future'] as const).map((time) => (
                <tr key={time}>
                  <th scope="row">{time[0].toUpperCase() + time.slice(1)}</th>
                  {(
                    [
                      'Simple',
                      'Continuous',
                      'Perfect',
                      'PerfectContinuous',
                    ] as const
                  ).map((aspect) => {
                    const id: TenseId = `${time}${aspect}`;
                    const tense = times.find((t) => t.id === id)!;
                    return (
                      <td key={id}>
                        <button
                          onClick={() => drill.toggleTense(id)}
                          aria-label={tense.label}
                          aria-pressed={drill.selectedTenses.includes(id)}
                          aria-describedby="drill-selection-help"
                        >
                          <Formula tense={id} form={form} />
                          <strong lang="en">
                            {overviewExamples[id][forms.indexOf(form)]}
                          </strong>
                          <small>{tense.exp}</small>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.caption}>
          В основе примеров — work. Некоторые формы, особенно Future Perfect
          Continuous, встречаются редко: выбор определяется контекстом.
        </p>
      </div>
      <div className="panel">
        <div className={styles.heading}>
          <div>
            <h2>{groups[group].name}</h2>
            <p>{groups[group].desc}</p>
          </div>
          <GroupSelect value={group} onChange={setGroup} />
        </div>
        <div
          className={styles.scroll}
          role="region"
          aria-label="Подробная таблица конструкций"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Время</th>
                {forms.map((f) => (
                  <th scope="col" key={f}>
                    {formNames[f]} ({formSigns[f]})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups[group].ids.map((id) => (
                <tr key={id}>
                  <th scope="row">{times.find((t) => t.id === id)!.label}</th>
                  {forms.map((f) => {
                    const item = example(id, f);
                    return (
                      <td key={f}>
                        <Formula tense={id} form={f} />
                        <strong lang="en">{item.en}</strong>
                        <small>{item.ru}</small>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          {group === 'simple'
            ? 'Дрилл-таблица охватывает три времени Simple. Глагол to be и модальные глаголы работают по отдельным правилам.'
            : group === 'presentPerfect'
              ? 'Present Perfect: have/has + V3. Маркеры already / yet — подсказки, а не обязательные признаки.'
              : 'Это расширение матрицы на другие аспекты. При выборе формы ориентируйся на смысл и контекст.'}
        </p>
        <button
          className="button"
          onClick={() => {
            root.translation.setGroup(group);
            root.navigate('translation');
          }}
        >
          Тренировать эту таблицу
        </button>
      </div>
    </section>
  );
});
