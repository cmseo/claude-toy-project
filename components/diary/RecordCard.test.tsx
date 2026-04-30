import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecordCard } from "./RecordCard";
import type { DiaryEntry } from "@/types/diary";

const lessonEntry: DiaryEntry = {
  id: "a",
  type: "lesson",
  date: "2026-04-30",
  duration: 90,
  notes: "포핸드 리듬을 늦추자.",
  createdAt: "2026-04-30T10:00:00.000Z",
};

const matchEntry: DiaryEntry = {
  id: "b",
  type: "match",
  date: "2026-04-29",
  duration: 60,
  notes: "서브 1구가 약했다.",
  score: "6-4 6-3",
  result: "win",
  createdAt: "2026-04-29T11:00:00.000Z",
};

describe("RecordCard", () => {
  it("레슨 카드는 유형/날짜/소요 시간/느낀점을 표시한다", () => {
    render(<RecordCard entry={lessonEntry} />);
    expect(screen.getByText("레슨")).toBeInTheDocument();
    expect(screen.getByText("2026.04.30")).toBeInTheDocument();
    expect(screen.getByText(/1시간 30분/)).toBeInTheDocument();
    expect(screen.getByText("포핸드 리듬을 늦추자.")).toBeInTheDocument();
  });

  it("편집 버튼은 /edit/[id] 링크를 가진다", () => {
    render(<RecordCard entry={lessonEntry} />);
    const editLink = screen.getByRole("link", { name: "기록 편집" });
    expect(editLink).toHaveAttribute("href", "/edit/a");
  });

  it("onDelete가 주어지면 삭제 버튼이 클릭 시 호출된다", () => {
    const onDelete = vi.fn();
    render(<RecordCard entry={lessonEntry} onDelete={onDelete} />);
    screen.getByRole("button", { name: "기록 삭제" }).click();
    expect(onDelete).toHaveBeenCalledWith(lessonEntry);
  });

  it("경기 카드는 스코어와 승/패를 표시한다", () => {
    render(<RecordCard entry={matchEntry} />);
    expect(screen.getByText("경기")).toBeInTheDocument();
    expect(screen.getByText(/스코어 6-4 6-3/)).toBeInTheDocument();
    expect(screen.getByText("승")).toBeInTheDocument();
  });
});
