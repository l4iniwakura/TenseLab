import { makeAutoObservable } from 'mobx';
import {
  emptyProgress,
  localDay,
  PROGRESS_KEY,
  readProgress,
  writeText,
} from '../storage/local';

export class ProgressStore {
  stats = readProgress();
  day = localDay();
  storageAvailable = true;
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
  get accuracy() {
    return this.stats.done
      ? Math.round((this.stats.right / this.stats.done) * 100)
      : 0;
  }
  get todayCount() {
    return this.stats.today === this.day ? this.stats.todayCount : 0;
  }
  get percentage() {
    return Math.min(100, (this.todayCount / 20) * 100);
  }
  refreshDay() {
    this.day = localDay();
  }
  record(correct: boolean) {
    this.refreshDay();
    this.stats = {
      done: this.stats.done + 1,
      right: this.stats.right + Number(correct),
      streak: correct ? this.stats.streak + 1 : 0,
      today: this.day,
      todayCount: this.todayCount + 1,
    };
    this.persist();
  }
  reset() {
    this.stats = emptyProgress();
    this.persist();
  }
  persist() {
    this.storageAvailable = writeText(PROGRESS_KEY, JSON.stringify(this.stats));
  }
}
