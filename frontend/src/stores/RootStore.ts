import { makeAutoObservable } from 'mobx';
import { readText, THEME_KEY, writeText } from '../storage/local';
import { I18nStore, type UiKey } from './I18nStore';
import { DrillStore } from './DrillStore';
import { ProgressStore } from './ProgressStore';
import { TranslationStore } from './TranslationStore';
import type { Section } from '../domain/types';

export function sectionFromHash(hash: string): Section {
  const value = hash.replace('#', '');
  return value === 'translation' ||
    value === 'reference' ||
    value === 'progress'
    ? value
    : 'drill';
}
export class RootStore {
  i18n = new I18nStore();
  progress = new ProgressStore();
  drill = new DrillStore(this.progress);
  translation = new TranslationStore(this.progress);
  theme: 'light' | 'dark' = readText(THEME_KEY) === 'dark' ? 'dark' : 'light';
  section: Section = sectionFromHash(window.location.hash);
  messageKey: UiKey | null = null;
  get message() {
    return this.messageKey ? this.i18n.t(this.messageKey) : '';
  }
  constructor() {
    makeAutoObservable(
      this,
      { i18n: false, progress: false, drill: false, translation: false },
      { autoBind: true },
    );
  }
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    writeText(THEME_KEY, this.theme);
  }
  setSection(section: Section) {
    if (this.section !== section) {
      this.drill.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    this.section = section;
    this.progress.refreshDay();
    this.messageKey = null;
  }
  navigate(section: Section) {
    this.setSection(section);
    window.location.hash = section;
  }
  speak(text: string) {
    this.messageKey = null;
    if (
      !('speechSynthesis' in window) ||
      !('SpeechSynthesisUtterance' in window)
    ) {
      this.messageKey = 'speech.unavailable';
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.85;
    utterance.onerror = () => this.speechError();
    window.speechSynthesis.speak(utterance);
  }
  speechError() {
    this.messageKey = 'speech.error';
  }
}
