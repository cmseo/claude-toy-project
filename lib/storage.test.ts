import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addEntry,
  deleteEntry,
  getEntries,
  getPlaybook,
  savePlaybook,
  updateEntry,
} from "./storage";
import type { DiaryEntry, Playbook } from "@/types/diary";

const sampleEntry = (overrides: Partial<DiaryEntry> = {}): DiaryEntry => ({
  id: "id-1",
  type: "lesson",
  date: "2026-04-30",
  duration: 60,
  notes: "백핸드 연습",
  createdAt: "2026-04-30T10:00:00.000Z",
  ...overrides,
});

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("getEntries returns [] when storage is empty", () => {
    expect(getEntries()).toEqual([]);
  });

  it("addEntry persists entry and getEntries returns it", () => {
    const entry = sampleEntry();
    addEntry(entry);
    const result = getEntries();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(entry);
  });

  it("addEntry appends multiple entries", () => {
    addEntry(sampleEntry({ id: "a" }));
    addEntry(sampleEntry({ id: "b" }));
    expect(getEntries().map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("updateEntry mutates fields of matching id", () => {
    addEntry(sampleEntry({ id: "a", duration: 60 }));
    addEntry(sampleEntry({ id: "b", duration: 30 }));
    updateEntry("a", { duration: 120, notes: "수정됨" });
    const a = getEntries().find((e) => e.id === "a");
    expect(a?.duration).toBe(120);
    expect(a?.notes).toBe("수정됨");
  });

  it("deleteEntry removes matching id", () => {
    addEntry(sampleEntry({ id: "a" }));
    addEntry(sampleEntry({ id: "b" }));
    deleteEntry("a");
    expect(getEntries().map((e) => e.id)).toEqual(["b"]);
  });

  it("getPlaybook returns null when not saved", () => {
    expect(getPlaybook()).toBeNull();
  });

  it("savePlaybook persists and getPlaybook returns it", () => {
    const playbook: Playbook = {
      items: [{ id: "p1", text: "백핸드 강화" }],
      updatedAt: "2026-04-30T10:00:00.000Z",
    };
    savePlaybook(playbook);
    expect(getPlaybook()).toEqual(playbook);
  });
});
