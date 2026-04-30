import type { DiaryEntry, PlaybookItem } from "@/types/diary";

const MAX_ITEMS = 5;

const SENTENCE_SPLIT = /[.!?。！？\n]+/u;

function sentencesFromNotes(notes: string): string[] {
  return notes
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function generatePlaybook(entries: DiaryEntry[]): PlaybookItem[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const items: PlaybookItem[] = [];
  const seen = new Set<string>();

  for (const entry of sorted) {
    for (const sentence of sentencesFromNotes(entry.notes)) {
      const key = sentence.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ id: `${entry.id}:${items.length}`, text: sentence });
      if (items.length >= MAX_ITEMS) return items;
    }
  }

  return items;
}
