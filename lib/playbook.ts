import type { DiaryEntry, PlaybookItem } from "@/types/diary";

const MAX_ITEMS = 5;

/**
 * 기록의 notes를 문장 단위로 분리한 뒤, 무작위로 최대 5개를 선별한다.
 */
export function pickRandomPlaybook(entries: DiaryEntry[]): PlaybookItem[] {
  const sentences = entries.flatMap((entry) =>
    entry.notes
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  );

  if (sentences.length === 0) return [];

  const shuffled = [...sentences].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, MAX_ITEMS);

  return picked.map((text, i) => ({
    id: `rand-${Date.now()}-${i}`,
    text,
  }));
}
