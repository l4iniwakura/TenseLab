import { makeAutoObservable } from 'mobx';
import { groups, people, verbs } from '../domain/catalog';
import { eng } from '../domain/sentences';
import {
  forms,
  type Form,
  type GroupId,
  type PersonId,
  type TenseId,
} from '../domain/types';

interface Cell {
  tense: TenseId;
  form: Form;
}
export class DrillStore {
  group: GroupId = 'simple';
  selectedTenses: TenseId[] = [];
  customTenses: TenseId[] | null = null;
  order: 'ordered' | 'random' = 'ordered';
  speed = 0;
  autoReveal = false;
  person: PersonId = 0;
  verbIndex = 0;
  sequence: Cell[] = [];
  index = 0;
  visible = false;
  running = false;
  round = 0;
  timer: ReturnType<typeof setTimeout> | null = null;
  constructor() {
    makeAutoObservable(this, { timer: false }, { autoBind: true });
    this.newRound();
  }
  get current() {
    return this.sequence[this.index];
  }
  get answer() {
    return eng(
      this.current.tense,
      this.current.form,
      this.person,
      verbs[this.verbIndex],
    );
  }
  get source() {
    const verb = verbs[this.verbIndex];
    return `${people[this.person].en} · ${verb[0]} · ${verb[9]}`;
  }
  get percentage() {
    return (this.index / this.sequence.length) * 100;
  }
  makeSequence() {
    const sequence = (this.customTenses ?? groups[this.group].ids).flatMap(
      (tense) => forms.map((form) => ({ tense, form })),
    );
    if (this.order === 'random') {
      for (let i = sequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
      }
    }
    this.sequence = sequence;
    this.index = 0;
    this.visible = false;
  }
  newRound() {
    this.stop();
    this.choosePhrase();
    this.round++;
    this.makeSequence();
  }
  choosePhrase() {
    // Sample uniformly from all combinations except the immediately previous one.
    const total = people.length * verbs.length;
    const previous = this.person * verbs.length + this.verbIndex;
    let next = Math.floor(Math.random() * (total - 1));
    if (next >= previous) next++;
    this.person = Math.floor(next / verbs.length) as PersonId;
    this.verbIndex = next % verbs.length;
  }
  advance() {
    if (this.index === this.sequence.length - 1) {
      this.choosePhrase();
      this.round++;
      this.makeSequence();
    } else {
      this.index++;
      this.visible = false;
    }
  }
  next() {
    this.stop();
    this.advance();
  }
  jump(index: number) {
    if (index < 0 || index >= this.sequence.length) return;
    this.stop();
    this.index = index;
    this.visible = false;
  }
  toggleAnswer() {
    this.visible = !this.visible;
  }
  setGroup(group: GroupId) {
    this.group = group;
    this.customTenses = null;
    this.newRound();
  }
  toggleTense(tense: TenseId) {
    this.selectedTenses = this.selectedTenses.includes(tense)
      ? this.selectedTenses.filter((id) => id !== tense)
      : [...this.selectedTenses, tense];
  }
  selectTenses(tenses: TenseId[]) {
    this.selectedTenses = [...new Set(tenses)];
  }
  startCustom() {
    if (this.selectedTenses.length === 0) return;
    this.customTenses = [...this.selectedTenses];
    this.newRound();
  }
  setOrder(order: 'ordered' | 'random') {
    this.stop();
    this.order = order;
    this.makeSequence();
  }
  setSpeed(speed: number) {
    const resume = this.running;
    this.stop();
    this.speed = speed;
    if (resume) this.play();
  }
  setAutoReveal(value: boolean) {
    this.autoReveal = value;
  }
  stop() {
    this.running = false;
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
  play() {
    if (this.running) {
      this.stop();
      return;
    }
    this.running = true;
    this.timer = setTimeout(this.tick, (this.speed || 5) * 1000);
  }
  tick() {
    if (!this.running) return;
    const duration = (this.speed || 5) * 1000;
    if (this.autoReveal) {
      this.visible = true;
      this.timer = setTimeout(this.finishReveal, duration * 0.4);
    } else {
      this.advance();
      this.timer = setTimeout(this.tick, duration);
    }
  }
  finishReveal() {
    if (!this.running) return;
    this.advance();
    this.timer = setTimeout(this.tick, (this.speed || 5) * 600);
  }
}
