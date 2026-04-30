import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecordForm } from "./RecordForm";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RecordForm — 레슨 기록", () => {
  it("날짜 빈 채 저장하면 '날짜를 입력하세요' 메시지가 표시된다", async () => {
    const onSubmit = vi.fn();
    render(<RecordForm onSubmit={onSubmit} />);

    const dateInput = screen.getByLabelText("날짜") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("날짜를 입력하세요")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("소요 시간이 비어있으면 '소요 시간을 입력하세요' 메시지가 표시된다", async () => {
    const onSubmit = vi.fn();
    render(<RecordForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("소요 시간을 입력하세요")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("0 이하의 소요 시간은 '소요 시간을 입력하세요' 메시지가 표시된다", async () => {
    const onSubmit = vi.fn();
    render(<RecordForm onSubmit={onSubmit} />);
    const durationInput = screen.getByLabelText("소요 시간(분)") as HTMLInputElement;
    fireEvent.change(durationInput, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("소요 시간을 입력하세요")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("유효한 입력 후 저장하면 onSubmit이 정확한 값으로 호출된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RecordForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-04-30" } });
    fireEvent.change(screen.getByLabelText("소요 시간(분)"), { target: { value: "60" } });
    await user.type(screen.getByLabelText("느낀점"), "백핸드 리듬을 늦추자.");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: "lesson",
      date: "2026-04-30",
      duration: 60,
      notes: "백핸드 리듬을 늦추자.",
      score: undefined,
      result: undefined,
    });
  });

  it("기본값으로 오늘 날짜가 설정된다", () => {
    render(<RecordForm onSubmit={vi.fn()} />);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    expect((screen.getByLabelText("날짜") as HTMLInputElement).value).toBe(`${yyyy}-${mm}-${dd}`);
  });
});
