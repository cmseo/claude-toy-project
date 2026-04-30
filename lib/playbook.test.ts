import { describe, expect, it } from "vitest";
import { buildPrompt } from "./playbook";
import type { DiaryEntry } from "@/types/diary";

const e = (id: string, notes: string, date = "2026-04-30"): DiaryEntry => ({
  id,
  type: "lesson",
  date,
  duration: 60,
  notes,
  createdAt: `${date}T10:00:00.000Z`,
});

describe("buildPrompt", () => {
  it("모든 entry의 notes를 포함한 프롬프트를 생성한다", () => {
    const entries = [
      e("a", "백핸드 타이밍을 늦춰야 한다"),
      e("b", "서브 토스를 높이 올리자"),
    ];
    const prompt = buildPrompt(entries);
    expect(prompt).toContain("백핸드 타이밍을 늦춰야 한다");
    expect(prompt).toContain("서브 토스를 높이 올리자");
  });

  it("한국어 행동 지침 체크리스트 5개를 요구하는 지시를 포함한다", () => {
    const entries = [e("a", "오늘 레슨에서 배운 것")];
    const prompt = buildPrompt(entries);
    expect(prompt).toMatch(/5/);
    expect(prompt).toMatch(/한국어/);
    expect(prompt).toMatch(/행동|실천|체크리스트/);
  });

  it("entry의 날짜와 유형 정보를 포함한다", () => {
    const entries = [e("a", "노트 내용", "2026-04-28")];
    const prompt = buildPrompt(entries);
    expect(prompt).toContain("2026-04-28");
    expect(prompt).toContain("레슨");
  });
});
