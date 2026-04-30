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

  it("addEntry adds entry and populates playbook items", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "강한 멘탈을 유지." }));
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.playbook?.items.length).toBeGreaterThan(0);
  });

  it("deleteEntry removes the entry by id", async () => {
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
  });

  it("addEntry: storage 실패 시 playbook이 이전 상태 그대로 유지된다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "초기 항목" }));
    });
    const initialPlaybook = result.current.playbook;
    expect(initialPlaybook?.items.length).toBeGreaterThan(0);

    const spy = vi.spyOn(storage, "addEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.addEntry(entry({ id: "b", notes: "실패할 항목" }));
      })
    ).toThrow("storage failure");

    expect(result.current.playbook).toEqual(initialPlaybook);
    spy.mockRestore();
  });

  it("updateEntry: storage 실패 시 playbook과 entries가 이전 상태 그대로 유지된다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "원본 노트" }));
    });
    const before = result.current.playbook;
    const beforeEntries = result.current.entries;

    const spy = vi.spyOn(storage, "updateEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.updateEntry("a", { notes: "수정 시도" });
      })
    ).toThrow("storage failure");

    expect(result.current.playbook).toEqual(before);
    expect(result.current.entries).toEqual(beforeEntries);
    spy.mockRestore();
  });

  it("deleteEntry: storage 실패 시 playbook과 entries가 이전 상태 그대로 유지된다", async () => {
    const { result } = renderHook(() => useDiary());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addEntry(entry({ id: "a", notes: "지키고 싶은 노트" }));
    });
    const before = result.current.playbook;
    const beforeEntries = result.current.entries;

    const spy = vi.spyOn(storage, "deleteEntry").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() =>
      act(() => {
        result.current.deleteEntry("a");
      })
    ).toThrow("storage failure");

    expect(result.current.playbook).toEqual(before);
    expect(result.current.entries).toEqual(beforeEntries);
    spy.mockRestore();
  });
});
