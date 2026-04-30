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

describe("useDiary", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
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

  it("regeneratePlaybook picks random items and clears stale flag", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "포핸드 팔로스루.\n서브 토스 높이" }));
    });

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    expect(result.current.playbook?.items.length).toBeGreaterThan(0);
    expect(result.current.playbook?.items.length).toBeLessThanOrEqual(5);
    expect(result.current.isGenerating).toBe(false);
    expect(localStorage.getItem("tennis-playbook:playbook-stale:v1")).toBeNull();
  });

  it("regeneratePlaybook does nothing with empty entries", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.regeneratePlaybook();
    });

    expect(result.current.playbook).toBeNull();
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
