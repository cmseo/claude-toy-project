import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TimeSummary } from "./TimeSummary";
import type { DiaryEntry } from "@/types/diary";

const now = new Date(2026, 3, 30); // 2026-04-30 (Thursday)

const e = (id: string, date: string, duration: number): DiaryEntry => ({
  id,
  type: "lesson",
  date,
  duration,
  notes: "",
  createdAt: `${date}T12:00:00.000Z`,
});

describe("TimeSummary", () => {
  it("기본은 이번 달 합계를 표시한다", () => {
    const entries: DiaryEntry[] = [
      e("a", "2026-04-01", 60),
      e("b", "2026-04-30", 30),
      e("c", "2026-03-30", 90), // 지난달 — 제외
    ];
    render(<TimeSummary entries={entries} now={now} />);
    expect(screen.getByText("1시간 30분")).toBeInTheDocument();
  });

  it("기록이 없으면 0분이 표시된다", () => {
    render(<TimeSummary entries={[]} now={now} />);
    expect(screen.getByText("0분")).toBeInTheDocument();
  });

  it("주 탭 선택 시 이번 주 합계로 바뀐다", async () => {
    const user = userEvent.setup();
    // 주 시작은 월요일(2026-04-27)부터
    const entries: DiaryEntry[] = [
      e("a", "2026-04-27", 60), // 이번주
      e("b", "2026-04-30", 30), // 이번주
      e("c", "2026-04-26", 999), // 지난주 — 제외
    ];
    render(<TimeSummary entries={entries} now={now} />);
    await user.click(screen.getByRole("radio", { name: "주" }));
    expect(screen.getByText("1시간 30분")).toBeInTheDocument();
  });

  it("년 탭 선택 시 올해 합계로 바뀐다", async () => {
    const user = userEvent.setup();
    const entries: DiaryEntry[] = [
      e("a", "2026-01-01", 60),
      e("b", "2026-04-30", 30),
      e("c", "2025-12-31", 999), // 작년 — 제외
    ];
    render(<TimeSummary entries={entries} now={now} />);
    await user.click(screen.getByRole("radio", { name: "년" }));
    expect(screen.getByText("1시간 30분")).toBeInTheDocument();
  });

  it("전체 탭 선택 시 누적 합계와 첫 기록 날짜가 표시된다", async () => {
    const user = userEvent.setup();
    const entries: DiaryEntry[] = [
      e("a", "2024-05-15", 60),
      e("b", "2026-04-30", 30),
    ];
    render(<TimeSummary entries={entries} now={now} />);
    await user.click(screen.getByRole("radio", { name: "전체" }));
    expect(screen.getByText("24년 05월 15일부터 1시간 30분")).toBeInTheDocument();
  });

  it("전체 탭에서 기록이 없으면 0분만 표시된다", async () => {
    const user = userEvent.setup();
    render(<TimeSummary entries={[]} now={now} />);
    await user.click(screen.getByRole("radio", { name: "전체" }));
    expect(screen.getByText("0분")).toBeInTheDocument();
  });
});
