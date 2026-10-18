import { makeAutoObservable } from 'mobx';
import { localDay, PROGRESS_KEY } from '../storage/local';
import {
  backupRaw,
  emptyDay,
  HISTORY_KEY,
  isDay,
  loadProgress,
  validateProgress,
  type ProgressData,
  type StorageProblem,
} from '../storage/progress';

export class ProgressStore {
  data: ProgressData;
  day = localDay();
  selectedDay: string | null = null;
  problem: StorageProblem;
  private savedRaw: string | null;
  constructor() {
    const loaded = loadProgress();
    this.data = loaded.data;
    this.problem = loaded.problem;
    this.savedRaw = loaded.raw;
    makeAutoObservable(this, {}, { autoBind: true });
  }
  get storageAvailable() {
    return this.problem === null;
  }
  // Keep the existing translation consumer contract while storing history separately.
  get stats() {
    return {
      ...this.data.totals,
      today: this.day,
      todayCount: this.todayCount,
    };
  }
  get accuracy() {
    return this.stats.done
      ? Math.round((this.stats.right / this.stats.done) * 100)
      : 0;
  }
  get todayCount() {
    return this.forDay(this.day).done;
  }
  get percentage() {
    return Math.min(100, (this.todayCount / 20) * 100);
  }
  get viewingDay() {
    return this.selectedDay ?? this.day;
  }
  get selected() {
    return this.forDay(this.viewingDay);
  }
  forDay(day: string) {
    return this.data.days[day] ?? emptyDay();
  }
  selectDay(day: string) {
    if (isDay(day) && day <= this.day) this.selectedDay = day;
  }
  showToday() {
    this.selectedDay = null;
  }
  refreshDay() {
    this.day = localDay();
  }
  record(correct: boolean) {
    this.refreshDay();
    const entry = { ...this.forDay(this.day) };
    entry.done++;
    entry.right += Number(correct);
    this.data.days[this.day] = entry;
    this.data.totals.done++;
    this.data.totals.right += Number(correct);
    this.data.totals.streak = correct ? this.data.totals.streak + 1 : 0;
    this.persist();
  }
  recordDrill() {
    this.refreshDay();
    this.data.days[this.day] = {
      ...this.forDay(this.day),
      drills: this.forDay(this.day).drills + 1,
    };
    this.data.totals.drills++;
    this.persist();
  }
  persist() {
    // Unknown/corrupt/unreadable data is protected, even while practising in memory.
    if (
      this.problem === 'invalid' ||
      this.problem === 'read' ||
      this.problem === 'conflict'
    )
      return;
    try {
      if (localStorage.getItem(HISTORY_KEY) !== this.savedRaw) {
        this.problem = 'conflict';
        return;
      }
      if (this.savedRaw === null) {
        const old = localStorage.getItem(PROGRESS_KEY);
        if (old !== null) backupRaw(PROGRESS_KEY, old);
      }
      const raw = JSON.stringify(validateProgress(this.data));
      localStorage.setItem(HISTORY_KEY, raw);
      this.savedRaw = raw;
      this.problem = null;
    } catch {
      this.problem = 'write';
    }
  }
}
