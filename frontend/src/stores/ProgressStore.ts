import { makeAutoObservable } from 'mobx';
import { localDay, PROGRESS_KEY } from '../storage/local';
import {
  backupRaw,
  CHANNEL,
  emptyDay,
  HISTORY_KEY,
  isDay,
  LEGACY_KEY,
  loadProgress,
  migrateV1,
  newProgress,
  parseBackup,
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
  exportBackup() {
    return JSON.stringify(
      {
        format: 'tenselab-progress',
        exportedAt: new Date().toISOString(),
        channel: CHANNEL,
        data: this.data,
      },
      null,
      2,
    );
  }
  exportOriginal() {
    return (
      localStorage.getItem(HISTORY_KEY) ??
      localStorage.getItem(PROGRESS_KEY) ??
      ''
    );
  }
  legacyBackup() {
    if (this.data.legacyRecovered) throw new Error('recovered');
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw === null) throw new Error('missing');
    return { ...migrateV1(raw), legacyRecovered: true } as ProgressData;
  }
  previewImport(text: string) {
    return parseBackup(text);
  }
  localBackups() {
    const prefixes = [`${HISTORY_KEY}:backup:`, `${PROGRESS_KEY}:backup:`];
    return Object.keys(localStorage)
      .filter((key) => prefixes.some((prefix) => key.startsWith(prefix)))
      .sort()
      .reverse();
  }
  readLocalBackup(key: string) {
    if (!this.localBackups().includes(key)) throw new Error('missing');
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error('missing');
    return raw;
  }
  previewLocalBackup(key: string) {
    const raw = this.readLocalBackup(key);
    if (key.startsWith(`${PROGRESS_KEY}:backup:`)) return migrateV1(raw);
    return parseBackup(raw);
  }
  replace(data: ProgressData) {
    const next = validateProgress(data);
    try {
      const current = localStorage.getItem(HISTORY_KEY);
      if (current !== this.savedRaw) {
        this.problem = 'conflict';
        return false;
      }
      if (current !== null) backupRaw(HISTORY_KEY, current);
      const old = localStorage.getItem(PROGRESS_KEY);
      if (old !== null) backupRaw(PROGRESS_KEY, old);
      if (next.legacyRecovered) {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy !== null) backupRaw(LEGACY_KEY, legacy);
      }
      // Includes any unsaved practice in this session.
      backupRaw(HISTORY_KEY, this.exportBackup());
      const raw = JSON.stringify(next);
      localStorage.setItem(HISTORY_KEY, raw);
      this.savedRaw = raw;
      this.data = next;
      this.selectedDay = null;
      this.problem = null;
      return true;
    } catch {
      this.problem = 'write';
      return false;
    }
  }
  reset() {
    const next = newProgress();
    next.legacyRecovered = this.data.legacyRecovered;
    return this.replace(next);
  }
}
