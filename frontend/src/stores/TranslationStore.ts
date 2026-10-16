import { makeAutoObservable } from 'mobx';
import { groups, verbs } from '../domain/catalog';
import { example } from '../domain/sentences';
import { normalize } from '../domain/answers';
import {
  forms,
  type Exercise,
  type Form,
  type GroupId,
  type PersonId,
  type TenseId,
} from '../domain/types';
import type { ProgressStore } from './ProgressStore';

type Coordinates = [TenseId, Form, PersonId, number];
export class TranslationStore {
  group: GroupId = 'simple';
  tense: TenseId | 'all' = 'all';
  form: Form | 'all' = 'all';
  person: PersonId | 'all' = 'all';
  current: Exercise = example('presentSimple', 'pos');
  queue: Coordinates[] = [];
  revealed = false;
  input = '';
  cardNumber = 0;
  constructor(readonly progress: ProgressStore) {
    makeAutoObservable(this, { progress: false }, { autoBind: true });
    this.next();
  }
  get pool(): Coordinates[] {
    const tenses = this.tense === 'all' ? groups[this.group].ids : [this.tense];
    const selectedForms = this.form === 'all' ? forms : [this.form];
    const people: PersonId[] =
      this.person === 'all' ? [0, 1, 2, 3, 4, 5] : [this.person];
    return tenses.flatMap((t) =>
      selectedForms.flatMap((f) =>
        people.flatMap((p) =>
          verbs.map((_, vi) => [t, f, p, vi] as Coordinates),
        ),
      ),
    );
  }
  get matches() {
    return normalize(this.input) === normalize(this.current.en);
  }
  get comparisonKey() {
    if (!this.input.trim()) return 'comparison.spoken' as const;
    return this.matches
      ? ('comparison.match' as const)
      : ('comparison.other' as const);
  }
  setGroup(group: GroupId) {
    this.group = group;
    this.tense = 'all';
    this.filtersChanged();
  }
  setTense(tense: TenseId | 'all') {
    this.tense = tense;
    this.filtersChanged();
  }
  setForm(form: Form | 'all') {
    this.form = form;
    this.filtersChanged();
  }
  setPerson(person: PersonId | 'all') {
    this.person = person;
    this.filtersChanged();
  }
  setInput(input: string) {
    this.input = input;
  }
  filtersChanged() {
    this.queue = [];
    this.next();
  }
  trainTense(tense: TenseId, group: GroupId) {
    this.group = group;
    this.tense = tense;
    this.filtersChanged();
  }
  next() {
    const pool = this.pool;
    const pick =
      this.queue.length && Math.random() < 0.33
        ? this.queue.shift()!
        : pool[Math.floor(Math.random() * pool.length)];
    this.current = example(...pick);
    this.cardNumber++;
    this.revealed = false;
    this.input = '';
  }
  reveal() {
    this.revealed = true;
  }
  mark(correct: boolean) {
    if (!this.revealed) return;
    if (!correct)
      this.queue.push([
        this.current.tense,
        this.current.form,
        this.current.p,
        this.current.vi,
      ]);
    this.progress.record(correct);
    this.next();
  }
}
