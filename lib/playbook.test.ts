import { describe, expect, it } from "vitest";
import { generatePlaybook } from "./playbook";
import type { DiaryEntry } from "@/types/diary";

const e = (id: string, notes: string): DiaryEntry => ({
  id,
  type: "lesson",
  date: "2026-04-30",
  duration: 60,
  notes,
  createdAt: "2026-04-30T10:00:00.000Z",
});

describe("generatePlaybook", () => {
  it("빈 entries → 빈 배열", () => {
    expect(generatePlaybook([])).toEqual([]);
  });

  it("최대 5개 항목을 반환한다", () => {
    const entries = [
      e("a", "문장1. 문장2. 문장3."),
      e("b", "문장4. 문장5. 문장6. 문장7."),
    ];
    expect(generatePlaybook(entries).length).toBeLessThanOrEqual(5);
  });

  it("중복 문장은 한 번만 포함된다", () => {
    const entries = [
      e("a", "백핸드 리듬을 늦추자."),
      e("b", "백핸드 리듬을 늦추자."),
    ];
    const texts = generatePlaybook(entries).map((item) => item.text);
    const unique = new Set(texts.map((t) => t.toLowerCase()));
    expect(unique.size).toBe(texts.length);
  });

  it("전체 pool에서 뽑으므로 오래된 기록도 항목에 포함될 수 있다", () => {
    const entries = [
      e("old", "오래된 교훈."),
      e("new", "최신 교훈."),
    ];
    const results = Array.from({ length: 20 }, () => generatePlaybook(entries));
    const hasOld = results.some((r) => r.some((item) => item.text === "오래된 교훈"));
    const hasNew = results.some((r) => r.some((item) => item.text === "최신 교훈"));
    expect(hasOld).toBe(true);
    expect(hasNew).toBe(true);
  });
});
