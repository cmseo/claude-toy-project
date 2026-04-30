import { describe, expect, it } from "vitest";
import { pickRandomPlaybook } from "./playbook";
import type { DiaryEntry } from "@/types/diary";

const e = (id: string, notes: string, date = "2026-04-30"): DiaryEntry => ({
  id,
  type: "lesson",
  date,
  duration: 60,
  notes,
  createdAt: `${date}T10:00:00.000Z`,
});

describe("pickRandomPlaybook", () => {
  it("notes를 문장 단위로 분리하여 최대 5개를 반환한다", () => {
    const entries = [
      e("a", "백핸드 타이밍을 늦춰야 한다.\n서브 토스를 높이 올리자"),
      e("b", "포핸드 팔로스루를 끝까지.\n발리 스플릿 스텝.\n리턴 준비를 빨리"),
    ];
    const items = pickRandomPlaybook(entries);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.id).toMatch(/^rand-/);
      expect(item.text.length).toBeGreaterThan(0);
    });
  });

  it("빈 entries일 때 빈 배열을 반환한다", () => {
    expect(pickRandomPlaybook([])).toEqual([]);
  });

  it("문장이 5개 미만이면 있는 만큼만 반환한다", () => {
    const entries = [e("a", "하나.\n둘")];
    const items = pickRandomPlaybook(entries);
    expect(items.length).toBe(2);
  });
});
