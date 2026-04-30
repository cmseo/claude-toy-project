import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteDialog } from "./DeleteDialog";

describe("DeleteDialog", () => {
  it("열려있을 때 확인 메시지가 표시된다", () => {
    render(<DeleteDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText("기록을 삭제하시겠습니까?")).toBeInTheDocument();
  });

  it("삭제 버튼 클릭 시 onConfirm이 호출된다", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteDialog open={true} onOpenChange={vi.fn()} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("취소 버튼 클릭 시 onOpenChange(false)이 호출된다", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DeleteDialog open={true} onOpenChange={onOpenChange} onConfirm={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("닫혀있을 때는 다이얼로그 내용이 보이지 않는다", () => {
    render(<DeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText("기록을 삭제하시겠습니까?")).not.toBeInTheDocument();
  });
});
