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

describe("RecordForm — 경기 조건부 필드", () => {
  it("기본 레슨 모드에서는 스코어/결과 필드가 보이지 않는다", () => {
    render(<RecordForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText("스코어")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "승" })).not.toBeInTheDocument();
  });

  it("경기로 전환하면 스코어/결과 필드가 나타나고, 다시 레슨으로 바꾸면 사라진다", async () => {
    const user = userEvent.setup();
    render(<RecordForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("radio", { name: "경기" }));
    expect(screen.getByLabelText("스코어")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "승" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "패" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "레슨" }));
    expect(screen.queryByLabelText("스코어")).not.toBeInTheDocument();
  });

  it("경기 모드 저장 시 score와 result가 onSubmit 인자에 포함된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RecordForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "경기" }));
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-04-29" } });
    fireEvent.change(screen.getByLabelText("소요 시간(분)"), { target: { value: "75" } });
    await user.type(screen.getByLabelText("스코어"), "6-4 6-3");
    await user.click(screen.getByRole("radio", { name: "승" }));
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "match",
        date: "2026-04-29",
        duration: 75,
        score: "6-4 6-3",
        result: "win",
      }),
    );
  });
});
