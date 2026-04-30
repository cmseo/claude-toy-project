import type { DiaryEntry, PlaybookItem } from "@/types/diary";

const MAX_ITEMS = 5;

const SENTENCE_SPLIT = /[.!?。！？\n]+/u;

function sentencesFromNotes(notes: string): string[] {
  return notes
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function generatePlaybook(entries: DiaryEntry[]): PlaybookItem[] {
  if (entries.length === 0) return [];

  const seen = new Set<string>();
  const pool: Array<{ entryId: string; text: string }> = [];

  for (const entry of entries) {
    for (const sentence of sentencesFromNotes(entry.notes)) {
      const key = sentence.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ entryId: entry.id, text: sentence });
    }
  }

  return shuffle(pool)
    .slice(0, MAX_ITEMS)
    .map((item, index) => ({
      id: `${item.entryId}:${index}`,
      text: item.text,
    }));
}
