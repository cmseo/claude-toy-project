import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDiary } from "./useDiary";
import type { DiaryEntry } from "@/types/diary";
import * as storage from "@/lib/storage";

const entry = (overrides: Partial<DiaryEntry> = {}): DiaryEntry => ({
  id: crypto.randomUUID(),
  type: "lesson",
  date: "2026-04-30",
  duration: 60,
  notes: "백핸드 리듬을 늦추자.",
  createdAt: new Date().toISOString(),
  ...overrides,
});

const mockPlaybookResponse = {
  items: [
    { id: "ai-1", text: "백핸드 준비 자세" },
    { id: "ai-2", text: "서브 토스 높이" },
    { id: "ai-3", text: "리턴 스플릿 스텝" },
    { id: "ai-4", text: "포핸드 팔로스루" },
    { id: "ai-5", text: "멘탈 유지" },
  ],
  updatedAt: "2026-04-30T12:00:00.000Z",
};

describe("useDiary", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("addEntry adds entry to localStorage and sets playbook-stale flag", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "강한 멘탈을 유지." }));
    });

    expect(result.current.entries).toHaveLength(1);
    expect(localStorage.getItem("tennis-playbook:playbook-stale:v1")).toBe("true");
  });

  it("deleteEntry removes the entry and sets playbook-stale flag", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a" }));
      result.current.addEntry(entry({ id: "b" }));
    });
    act(() => {
      result.current.deleteEntry("a");
    });

    expect(result.current.entries.map((e) => e.id)).toEqual(["b"]);
    expect(localStorage.getItem("tennis-playbook:playbook-stale:v1")).toBe("true");
  });

  it("regeneratePlaybook fetches from API and updates playbook state", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaybookResponse,
    });

    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "테스트 노트" }));
    });

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    expect(result.current.playbook?.items).toHaveLength(5);
    expect(result.current.isGenerating).toBe(false);
    expect(localStorage.getItem("tennis-playbook:playbook-stale:v1")).toBeNull();
  });

  it("regeneratePlaybook sets isGenerating during fetch", async () => {
    let resolvePromise: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(pending);

    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "노트" }));
    });

    let regeneratePromise: Promise<void>;
    act(() => {
      regeneratePromise = result.current.regeneratePlaybook();
    });

    expect(result.current.isGenerating).toBe(true);

    await act(async () => {
      resolvePromise!({ ok: true, json: async () => mockPlaybookResponse });
      await regeneratePromise!;
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it("regeneratePlaybook sets generationError on failure and keeps existing playbook", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaybookResponse,
    });

    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "초기 항목" }));
    });

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    const existingPlaybook = result.current.playbook;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "서버 에러" }),
    });

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    expect(result.current.generationError).toBe("서버 에러");
    expect(result.current.playbook).toEqual(existingPlaybook);
  });

  it("regeneratePlaybook handles AbortError as timeout", async () => {
    const abortError = new Error("The operation was aborted.");
    abortError.name = "AbortError";
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "노트" }));
    });

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    expect(result.current.generationError).toContain("시간이 초과");
    expect(result.current.isGenerating).toBe(false);
  });

  it("addEntry: storage 실패 시 entries와 stale 플래그가 변경되지 않는다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    const spy = vi.spyOn(storage, "addEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.addEntry(entry({ id: "b", notes: "실패할 항목" }));
      })
    ).toThrow("storage failure");

    expect(result.current.entries).toHaveLength(0);
    spy.mockRestore();
  });

  it("updateEntry: storage 실패 시 entries가 이전 상태 그대로 유지된다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "원본 노트" }));
    });
    const beforeEntries = result.current.entries;

    const spy = vi.spyOn(storage, "updateEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.updateEntry("a", { notes: "수정 시도" });
      })
    ).toThrow("storage failure");

    expect(result.current.entries).toEqual(beforeEntries);
    spy.mockRestore();
  });

  it("deleteEntry: storage 실패 시 entries가 이전 상태 그대로 유지된다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "지키고 싶은 노트" }));
    });
    const beforeEntries = result.current.entries;

    const spy = vi.spyOn(storage, "deleteEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.deleteEntry("a");
      })
    ).toThrow("storage failure");

    expect(result.current.entries).toEqual(beforeEntries);
    spy.mockRestore();
  });
});
