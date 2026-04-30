import type { DiaryEntry, Playbook } from "@/types/diary";

const ENTRIES_KEY = "tennis-playbook:entries:v1";
const PLAYBOOK_KEY = "tennis-playbook:playbook:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getEntries(): DiaryEntry[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DiaryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: DiaryEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: DiaryEntry): void {
  if (!isBrowser()) return;
  const entries = getEntries();
  entries.push(entry);
  writeEntries(entries);
}

export function updateEntry(id: string, patch: Partial<DiaryEntry>): void {
  if (!isBrowser()) return;
  const entries = getEntries().map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e));
  writeEntries(entries);
}

export function deleteEntry(id: string): void {
  if (!isBrowser()) return;
  const entries = getEntries().filter((e) => e.id !== id);
  writeEntries(entries);
}

export function getPlaybook(): Playbook | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(PLAYBOOK_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Playbook;
  } catch {
    return null;
  }
}

export function savePlaybook(playbook: Playbook): void {
  if (!isBrowser()) return;
  localStorage.setItem(PLAYBOOK_KEY, JSON.stringify(playbook));
}

export function clearAll(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ENTRIES_KEY);
  localStorage.removeItem(PLAYBOOK_KEY);
}
