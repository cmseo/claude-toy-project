import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlaybookList } from "./PlaybookList";
import type { Playbook } from "@/types/diary";

const playbook: Playbook = {
  items: [
    { id: "p1", text: "백핸드 리듬을 늦추자" },
    { id: "p2", text: "서브 1구는 안정적으로" },
  ],
  updatedAt: "2026-04-30T15:30:00.000Z",
};

describe("PlaybookList", () => {
  it("기록이 없으면 빈 상태 메시지를 표시한다", () => {
    render(<PlaybookList playbook={null} hasEntries={false} isLoading={false} />);
    expect(screen.getByText("아직 기록이 없어요.")).toBeInTheDocument();
  });

  it("기록이 있고 playbook 항목이 있으면 번호 매긴 목록을 표시한다", () => {
    render(<PlaybookList playbook={playbook} hasEntries={true} isLoading={false} />);
    expect(screen.getByText("백핸드 리듬을 늦추자")).toBeInTheDocument();
    expect(screen.getByText("서브 1구는 안정적으로")).toBeInTheDocument();
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
  });

  it("마지막 갱신 시각을 표시한다", () => {
    render(<PlaybookList playbook={playbook} hasEntries={true} isLoading={false} />);
    expect(screen.getByText(/마지막 갱신:/)).toBeInTheDocument();
  });

  it("기록은 있지만 playbook 항목이 비어있으면 빈 상태를 표시한다", () => {
    const empty: Playbook = { items: [], updatedAt: "2026-04-30T00:00:00.000Z" };
    render(<PlaybookList playbook={empty} hasEntries={true} isLoading={false} />);
    expect(screen.getByText("아직 기록이 없어요.")).toBeInTheDocument();
  });

  it("isLoading이 true이면 스피너와 '플레이북 생성 중...' 텍스트를 표시한다", () => {
    render(<PlaybookList playbook={playbook} hasEntries={true} isLoading={true} />);
    expect(screen.getByText("플레이북 생성 중...")).toBeInTheDocument();
  });

  it("isLoading이 true이면 기존 playbook 항목은 표시하지 않는다", () => {
    render(<PlaybookList playbook={playbook} hasEntries={true} isLoading={true} />);
    expect(screen.queryByText("백핸드 리듬을 늦추자")).not.toBeInTheDocument();
  });
});
